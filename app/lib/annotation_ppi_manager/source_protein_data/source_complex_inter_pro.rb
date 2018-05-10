module AnnotationPpiManager
  module SourceProteinData
    module SourceComplexInterPro

      LocalPath = Settings.GS_LocalUpload

      include SourceComplexFeature
      
      def sourceComplexInterPro(pdbId,path=nil)
        config = { 
                    'colors'=>{
                      'default'=>nil
                    },
                    'type_key'=>'type'
        }
        return sourceComplexFeature(pdbId, "collectInterProDataFromUniprot", config, path=path) 
      end

    end
  end
end
