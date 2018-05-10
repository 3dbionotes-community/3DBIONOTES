module AnnotationPpiManager
  module SourceProteinData
    module SourceComplexVariants

      include SourceComplexFeature
      def sourceComplexVariants(pdbId,path=nil)
        config = { 
                    'colors'=>{
                      'default' => nil,
                    },
                    'type_key' => 'disease'
        }
        return sourceComplexFeature(pdbId, "collectVariantDataFromUniprot", config, path=path) 
      end

    end
  end
end
