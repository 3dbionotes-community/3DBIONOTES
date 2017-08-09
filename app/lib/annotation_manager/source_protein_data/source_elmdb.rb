module AnnotationManager
  module SourceProteinData
    module SourceElmdb 
      def sourceElmdbFromUniprot(uniprotAc)
        cmd = "/home/joan/tools/ELMDB_tool/get_elm_data "+uniprotAc
        out = `#{cmd}`
        return out 
      end
    end 
  end
end
