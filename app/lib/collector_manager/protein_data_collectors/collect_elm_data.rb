module CollectorManager
  module ProteinDataCollectors
    module CollectElmData

      include EbiServicesManager::EbiServicesFeatures
      include AnnotationManager::FetchProteinData
      include CollectorManager::CollectorTools
      def _collectElmDataFromUniprot(acc)
        out = []
        data = fetchElmdbFromUniprot(acc)
        data.each do |x|
          out.push( {'start'=> x["Start"], 'end'=> x["End"], 'type'=> 'ELM'} )
        end
        return out
      end
    end
  end
end
