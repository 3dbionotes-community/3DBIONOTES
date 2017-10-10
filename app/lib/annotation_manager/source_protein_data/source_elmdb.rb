module AnnotationManager
  module SourceProteinData
    module SourceElmdb 
      def sourceElmdbFromUniprot(uniprotAc)
        out = Elmdbentry.find_by(proteinId: uniprotAc)
        if out.nil?
          cmd = "/home/joan/tools/ELMDB_tool/get_elm_data "+uniprotAc
          out = `#{cmd}`
          out.gsub! /\\r/,"" 
          if out.length > 0
            Elmdbentry.create(proteinId: uniprotAc, data: out)
          end
        else
          out = out.data
        end
        return out 
      end
    end 
  end
end
