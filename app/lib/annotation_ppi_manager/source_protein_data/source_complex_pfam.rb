module AnnotationPpiManager
  module SourceProteinData
    module SourceComplexPfam

      LocalPath = Settings.GS_LocalUpload

      include SourceComplexFeature
      
      def sourceComplexPfam(pdbId,path=nil)
        config = { 
                    'colors'=>{
                      'default'=>nil
                    },
                    'type_key'=>'type'
        }
        return sourceComplexFeature(pdbId, "collectPfamDataFromUniprot", config, path=path) 
      end

    end
  end
end
