module AnnotationPpiManager
  module SourceProteinData
    module SourceComplexPtms

      LocalPath = Settings.GS_LocalUpload

      include SourceComplexFeature
      
      def sourceComplexPtms(pdbId,path=nil)
        config = { 
                    'colors'=>{
                      'default'=>nil,
                      'methylation'=>'#00AF00',
                      'ubiquitination'=>'#FF6600',
                      'sustrate-kinase interaction'=>'#603',
                      'phosphorylation'=>'#1293FE',
                      'regulatory site'=>'#603',
                      'acetylation'=>'#660000',
                      'sumoylation'=>'#AF0066',
                      'glcnac'=>'#C36',
                      'o-glcnac'=>'#C36',
                      'disulfid'=>'#23B14D'
                    },
                    'type_key'=>'type'
        }
        job = SetComplexFeatureJob.perform_later(pdbId, "collectPTMdataFromUniprot", config, path=path)
        return {job_id:job.job_id}
      end

    end
  end
end
