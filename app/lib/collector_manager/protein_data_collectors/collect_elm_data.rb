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
        data_ = fetchMobiFromUniprot(acc)
        data = data_['lips']
        data.each do |k,v|
          v.each do |x|
            out.push( {'start'=> x["start"], 'end'=> x["end"], 'type'=> 'LIP'} )
          end
        end
        return out
      end
    end
  end
end
