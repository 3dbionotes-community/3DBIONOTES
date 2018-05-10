module CollectorManager
  module ProteinDataCollectors
    module CollectVariantData

      include AnnotationManager::FetchProteinData
      include CollectorManager::CollectorTools
      def _collectVariantDataFromUniprot(acc)
        out = []
        data = fetchBiomutaFromUniprot(acc)
        data.each do |x|
          out.push( {'start'=> x['start'], 'end'=> x['end'], 'disease'=>x['disease']} )
        end
        data = fetchDsysmapFromUniprot(acc)
        data.each do |x|
          out.push( {'start'=> x['start'], 'end'=> x['end'], 'disease'=>x['disease']['text']} )
        end
        return out
      end
    end
  end
end
