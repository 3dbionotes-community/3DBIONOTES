module AnnotationManager
  module SourceProteinData
    module SourceDbptm 
      def sourceDbptmFromUniprot(uniprotAc)
        info = Dbptmentry.find_by(proteinId: uniprotAc)
        toReturn = []
        if !info.nil? and !info["data"].nil?
          toReturn=JSON.parse(info["data"])
        end
        return toReturn
      end
    end 
  end
end
