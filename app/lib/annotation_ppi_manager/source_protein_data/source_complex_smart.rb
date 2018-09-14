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
        job = SetComplexFeatureJob.perform_later(pdbId, "collectSmartDataFromUniprot", config, path=path)
        return {job_id:job.job_id}
      end

    end
  end
end
