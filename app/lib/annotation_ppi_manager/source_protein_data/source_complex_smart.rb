module AnnotationPpiManager
  module SourceProteinData
    module SourceComplexSmart

      LocalPath = Settings.GS_LocalUpload

      include SourceComplexFeature
      
      def sourceComplexSmart(pdbId,path=nil)
        config = { 
                    'colors'=>{
                      'default'=>nil
                    },
                    'type_key'=>'type'
        }
        return sourceComplexFeature(pdbId, "collectSmartDataFromUniprot", config, path=path) 
      end

    end
  end
end
