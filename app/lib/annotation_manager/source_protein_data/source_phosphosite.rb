module AnnotationManager
  module SourceProteinData
    module SourcePhosphosite 
      def sourcePhosphositeFromUniprot(uniprotAc)
        info = Phosphoentry.find_by(proteinId: uniprotAc)
        toReturn = []
        if !info.nil? and !info["data"].nil?
          toReturn=info["data"]
        end
        return toReturn
      end
    end 
  end
end
