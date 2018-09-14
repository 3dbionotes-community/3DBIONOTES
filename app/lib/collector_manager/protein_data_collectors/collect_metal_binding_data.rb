module CollectorManager
  module ProteinDataCollectors
    module CollectMetalBindingData

      include EbiServicesManager::EbiServicesFeatures
      include AnnotationManager::FetchProteinData
      include CollectorManager::CollectorTools

      def _collectMetalBindingDataFromUniprot(acc)
        out = []
        data = getFeaturesFromEBI(acc,"features")
        data['features'].each do |x|
          if x['type'] == "METAL" then
            description = "METAL_BS"
            out.push( {'start'=> x['begin'], 'end'=> x['end'], 'type'=> description} )
          end
        end
        return out
      end
    end
  end
end
