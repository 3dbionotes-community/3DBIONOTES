module CollectorManager
  module ProteinDataCollectors
    module CollectInterProData

      include EbiServicesManager::EbiServicesFeatures
      include AnnotationManager::FetchProteinData
      include CollectorManager::CollectorTools
      def _collectInterProDataFromUniprot(acc)
        out = []
        data = fetchInterproFromUniprot(acc)
        data.each do |x|
          type = x['description']['name']
          out.push( {'start'=> x['start'], 'end'=> x['end'], 'type'=> type} )
        end
        return out
      end
    end
  end
end
