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
        job = SetComplexFeatureJob.perform_later(pdbId, "collectInterProDataFromUniprot", config, path=path)
        return {job_id:job.job_id}
      end

    end
  end
end
