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
        job = SetComplexFeatureJob.perform_later(pdbId, "collectPfamDataFromUniprot", config, path=path)
        return {job_id:job.job_id}
      end

    end
  end
end
