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
        job = SetComplexFeatureJob.perform_later(pdbId, "collectVariantDataFromUniprot", config, path=path)
        return {job_id:job.job_id}
      end

    end
  end
end
