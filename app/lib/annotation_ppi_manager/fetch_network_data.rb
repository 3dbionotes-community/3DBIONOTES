module AnnotationPpiManager
  module FetchNetworkData

    include SourceProteinData::SourceNetworkFeature
    def fetchNetworkFeature(network,name,annotations)
      feature_call, config = configFeatureCall(name)
      job = SetNetworkFeatureJob.perform_later(network,feature_call,config,annotations=annotations)
      return {job_id:job.job_id}
    end

    def configFeatureCall(name)

      if name == "variants" then
        feature_call = "collectVariantDataFromUniprot"
        config = {'type_key'=>'disease','colors'=>{'default'=>nil}}

      elsif name == "ptms" then 
        feature_call = "collectPTMdataFromUniprot"
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

      elsif name == "pfam" then 
        feature_call = "collectPfamDataFromUniprot"
        config = { 
                    'colors'=>{
                      'default'=>nil
                    },
                    'type_key'=>'type'
        }

      elsif name == "smart" then 
        feature_call = "collectSmartDataFromUniprot"
        config = { 
                    'colors'=>{
                      'default'=>nil
                    },
                    'type_key'=>'type'
        }

      elsif name == "interpro" then 
        feature_call = "collectInterProDataFromUniprot"
        config = { 
                    'colors'=>{
                      'default'=>nil
                    },
                    'type_key'=>'type'
        }

      elsif name == "epitopes" then 
        feature_call = "collectEpitopesDataFromUniprot"
        config = { 
                    'colors'=>{
                      'epitope'=>'#83BE00',
                      'antigen'=>'#969',
                      'default'=>nil
                    },
                    'type_key'=>'type'
        }

      elsif name == "elms" then 
        feature_call = "collectElmDataFromUniprot"
        config = { 
                    'colors'=>{
                      'default'=>"#402060",
                      'elm'=>"#402060",
                      'lip'=>"#CC2060"
                    },
                    'type_key'=>'type'
        }
      elsif name == "custom" then 
        feature_call = "custom"
        config = { 
                    'colors'=>{
                      'default'=>nil
                    },
                    'type_key'=>'type'
        }

      end

      return feature_call, config
    end

  end
end
