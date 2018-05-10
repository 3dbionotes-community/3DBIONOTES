module AnnotationPpiManager
  module SourceProteinData
    module SourceComplexEpitopes

      LocalPath = Settings.GS_LocalUpload

      include SourceComplexFeature
      
      def sourceComplexEpitopes(pdbId,path=nil)
        config = { 
                    'colors'=>{
                      'epitope'=>'#83BE00',
                      'antigen'=>'#969',
                      'default'=>nil
                    },
                    'type_key'=>'type'
        }
        return sourceComplexFeature(pdbId, "collectEpitopesDataFromUniprot", config, path=path) 
      end

    end
  end
end
