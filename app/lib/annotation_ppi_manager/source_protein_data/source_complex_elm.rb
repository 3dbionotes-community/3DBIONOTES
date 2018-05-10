module AnnotationPpiManager
  module SourceProteinData
    module SourceComplexElm

      LocalPath = Settings.GS_LocalUpload

      include SourceComplexFeature
      
      def sourceComplexELM(pdbId,path=nil)
        config = { 
                    'colors'=>{
                      'default'=>"#402060"
                    },
                    'type_key'=>'type'
        }
        return sourceComplexFeature(pdbId, "collectElmDataFromUniprot", config, path=path) 
      end

    end
  end
end
