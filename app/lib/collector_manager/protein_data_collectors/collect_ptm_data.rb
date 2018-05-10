module CollectorManager
  module ProteinDataCollectors
    module CollectPtmData

      include EbiServicesManager::EbiServicesFeatures
      include AnnotationManager::FetchProteinData
      include CollectorManager::CollectorTools
      def _collectPTMdataFromUniprot(acc)
        out = []
        data = fetchPhosphositeFromUniprot(acc)
        data.each do |x|
          out.push( {'start'=> x['start'], 'end'=> x['end'], 'type'=> rename_ptm(x['subtype'])} )
        end
        data = fetchDbptmFromUniprot(acc)
        data.each do |x|
          out.push( {'start'=> x['start'], 'end'=> x['end'], 'type'=> rename_ptm(x['type'])} )
        end
        data = getFeaturesFromEBI(acc,"features")
        data['features'].each do |x|
          if x['category'] == "PTM" then
            if x['description'].length > 0 then
              description = x['description']
            else
              description = x['type']
            end
            if description.downcase == "disulfid"
              out.push( {'start'=> x['begin'], 'end'=> x['begin'], 'type'=> rename_ptm(description)} )
              out.push( {'start'=> x['end'], 'end'=> x['end'], 'type'=> rename_ptm(description)} )
            else
              out.push( {'start'=> x['begin'], 'end'=> x['end'], 'type'=> rename_ptm(description)} )
            end
          end
        end
        return out
      end
    end
  end
end
