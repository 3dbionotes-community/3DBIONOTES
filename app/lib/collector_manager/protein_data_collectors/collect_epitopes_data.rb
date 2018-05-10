module CollectorManager
  module ProteinDataCollectors
    module CollectEpitopesData

      include EbiServicesManager::EbiServicesFeatures
      include AnnotationManager::FetchProteinData
      include CollectorManager::CollectorTools
      def _collectEpitopesDataFromUniprot(acc)
        out = []
        data = fetchIEDBfromUniprot(acc)
        data.each do |x|
          out.push( {'start'=> x[:start], 'end'=> x[:end], 'type'=> 'EPITOPE'} )
        end
        data = getFeaturesFromEBI(acc,"antigen")
        if not data.key? "errorMessage" then
          puts data
          data['features'].each do |y|
            out.push( {'start'=> y['begin'], 'end'=> y['end'], 'type'=>y['type']} )
          end
        end
        return out
      end
    end
  end
end
