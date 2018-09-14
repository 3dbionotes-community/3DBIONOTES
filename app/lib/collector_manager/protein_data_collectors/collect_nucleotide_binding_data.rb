module CollectorManager
  module ProteinDataCollectors
    module CollectNucleotideBindingData

      include EbiServicesManager::EbiServicesFeatures
      include AnnotationManager::FetchProteinData
      include CollectorManager::CollectorTools

      def _collectNucleotideBindingDataFromUniprot(acc)
        out = []
        data = getFeaturesFromEBI(acc,"features")
        data['features'].each do |x|
          if x['type'] == "NP_BIND" then
            description = x['type']
            out.push( {'start'=> x['begin'], 'end'=> x['end'], 'type'=> description} )
          end
        end
        return out
      end
    end
  end
end
