module AnnotationPpiManager
  module SourceProteinData
    module SourceComplexCustomData

      LocalPath = Settings.GS_LocalUpload

      include SourceComplexFeature
      
      def sourceComplexCustomData(pdbId,path,annotations)
        config = { 
                    'colors'=>nil,
                    'type_key'=>'type',
                    'annotations'=>annotations
        }
        job = SetComplexFeatureJob.perform_later(pdbId, "custom_data", config, path=path)
        return {job_id:job.job_id}
      end

    end
  end
end
