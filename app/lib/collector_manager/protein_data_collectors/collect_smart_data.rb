module CollectorManager
  module ProteinDataCollectors
    module CollectSmartData

      include EbiServicesManager::EbiServicesFeatures
      include AnnotationManager::FetchProteinData
      include CollectorManager::CollectorTools
      def _collectSmartDataFromUniprot(acc)
        out = []
        data = fetchSmartFromUniprot(acc)
        data.each do |x|
          out.push( {'start'=> x['start'], 'end'=> x['end'], 'type'=> x['domain']} )
        end
        return out
      end
    end
  end
end
