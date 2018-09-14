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
        job = SetComplexFeatureJob.perform_later(pdbId, "collectEpitopesDataFromUniprot", config, path=path)
        return {job_id:job.job_id}
      end

    end
  end
end
