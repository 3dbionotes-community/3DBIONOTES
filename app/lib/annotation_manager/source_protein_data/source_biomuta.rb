module AnnotationManager
  module SourceProteinData
    module SourceBiomuta 
      def sourceBiomutaFromUniprot(uniprotAc)
        info = Biomutaentry.where(proteinId: uniprotAc)
        toReturn = []
        if !info.nil?
          info.each do |i|
            d = JSON.parse(i["data"])
            toReturn.push(*d)
          end
        end
        return toReturn
      end
    end 
  end
end
