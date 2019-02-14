module AnnotationManager
  module SourceProteinData
    module SourceSwissvar 
      def sourceSwissvarFromUniprot(uniprotAc)
        info = Swissvarentry.find_by(proteinId: uniprotAc)
        toReturn = []
        unless info.nil? then
          info = JSON.parse(info.data)
          toReturn = info
        end
        return toReturn
      end
    end 
  end
end
