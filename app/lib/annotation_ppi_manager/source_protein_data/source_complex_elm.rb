module AnnotationPpiManager
  module SourceProteinData
    module SourceComplexElm

      LocalPath = Settings.GS_LocalUpload

      include SourceComplexFeature
      
      def sourceComplexELM(pdbId,path=nil)
        config = { 
                    'colors'=>{
                      'default'=>"#402060",
                      'elm'=>"#402060",
                      'lip'=>"#CC2060"
                    },
                    'type_key'=>'type'
        }
        job = SetComplexFeatureJob.perform_later(pdbId, "collectElmDataFromUniprot", config, path=path)
        return {job_id:job.job_id}
      end

    end
  end
end
