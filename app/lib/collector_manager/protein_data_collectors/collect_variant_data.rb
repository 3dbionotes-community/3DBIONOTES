module CollectorManager
  module ProteinDataCollectors
    module CollectVariantData

      include AnnotationManager::FetchProteinData
      include CollectorManager::CollectorTools
      def _collectVariantDataFromUniprot(acc)
        out = []
        data = fetchBiomutaFromUniprot(acc)
        data.each do |x|
          out.push( {'start'=> x['start'], 'end'=> x['end'], 'disease'=>filterDisease(x['disease']), 'original'=>x['original'], 'variation'=>x['variation']} )
        end
        data = fetchDsysmapFromUniprot(acc)
        data.each do |x|
          out.push( {'start'=> x['start'], 'end'=> x['end'], 'disease'=>filterDisease(x['disease']['text']), 'original'=>x['original'], 'variation'=>x['variation']} )
        end
        return out
      end

      def filterDisease(name)
        if name =~ /DOI/i then
          x = name.split("/ ")
          y = x[1].split(" [")
          name = y[0]
        end
        return name
      end

    end
  end
end
