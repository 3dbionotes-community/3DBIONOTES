module CollectorManager
  module ProteinDataCollectors
    module CollectPfamData

      include EbiServicesManager::EbiServicesFeatures
      include AnnotationManager::FetchProteinData
      include CollectorManager::CollectorTools
      def _collectPfamDataFromUniprot(acc)
        out = []
        data = fetchPfamFromUniprot(acc)
        data.each do |x|
          out.push( {'start'=> x['start'], 'end'=> x['end'], 'type'=> x['id']} )
        end
        return out
      end
    end
  end
end
