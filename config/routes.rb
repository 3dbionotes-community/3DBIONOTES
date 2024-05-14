# frozen_string_literal: true

# TODO: to analyze which routes are no longer needed

Rails.application.routes.draw do
  get '/' => 'main#home'
  post '/' => 'main#home'
  get '/pdb_redo/:pdbId' => 'main#pdb_redo'
  get '/isolde/:pdbId/:filename' => 'main#isolde'
  get '/refmac/:pdbId/:filename' => 'main#refmac'
  get '/models/:protein/:source/:model' => 'main#models'
  post '/upload' => 'main#upload'
  get '/network' => 'main#network'
  post '/network/build' => 'main#network_build'
  get '/network/restore/:job_id' => 'main#network_restore'
  post '/chain_mapping' => 'main#chain_mapping'
  post '/programmatic/upload' => 'post_request#upload'
  get '/programmatic/fetch' => 'post_request#fetch'
  get '/programmatic/autofetch' => 'post_request#fetch'
  get '/programmatic/get/:id' => 'post_request#browse'
  get '/chain_mapping' => 'main#chain_mapping'
  get '/devel' => 'devel#home'
  get '/webserver' => 'webserver#home'
  get '/ws' => 'webserver#home'
  get '/ws/viewer' => 'webserver#viewer'
  get '/ws/submit' => 'webserver#submit'
  get '/ws/database' => 'webserver#query'
  get '/ws/covid19' => 'covid19#index'
  get '/ws/cv19', to: redirect('/ws/covid19')
  get '/ws/network' => 'webserver#network'
  get '/ws/help' => 'webserver#help'
  get '/ws/home' => 'webserver#home'
  get '/ws/api' => 'webserver#api'
  get '/annotationsIFrame' => 'frames_annotations#annotationsIFrame'
  get '/imported_annotationsIFrame' => 'frames_annotations#imported_annotationsIFrame'
  get '/analysisIFrame' => 'frames_annotations#analysisIFrame'
  get '/genomicIFrame' => 'frames_genomic#genomicIFrame'
  get '/sequenceIFrame' => 'frames_sequence#sequenceIFrame'

  scope '/compute' do
    scope '/molprobity' do
      get '/:name' => 'run_molprobity#get'
    end
    scope '/biopython' do
      scope '/interface' do
        get '/:name' => 'run_biopython_interface#run'
        get '/:path/:name' => 'run_biopython_interface#run'
      end
    end
    scope '/sequence_similars' do
      get '/:name' => 'import_proteins#import'
    end
    scope '/contingency' do
      scope '/uniprot' do
        post '/:acc' => 'contingency_analysis#analyse_uniprot'
        get '/:acc' => 'contingency_analysis#analyse_uniprot'
      end
      scope '/pdb' do
        post '/:pdb' => 'contingency_analysis#analyse_pdb'
        get '/:pdb' => 'contingency_analysis#analyse_pdb'
      end
    end
    scope '/correlation' do
      scope '/uniprot' do
        get '/:acc' => 'contingency_analysis#analyse_uniprot'
      end
      scope '/pdb' do
        get '/:pdb' => 'contingency_analysis#analyse_pdb'
      end
    end
  end

  scope '/api' do
    scope '/job' do
      scope '/status' do
        scope '/:job_id' do
          get '/' => 'job_status#check_status'
        end
      end
    end
    scope '/info' do
      scope '/EMDB' do
        scope '/available' do
          scope '/:name' do
            get '/' => 'info#isEMDBavailable'
          end
        end
        scope '/available_jsonp' do
          scope '/:name' do
            get '/' => 'info#isEMDBavailable_jsonp'
          end
        end
        scope '/size' do
          scope '/:name' do
            get '/' => 'info#getEMDBsize'
          end
        end
        scope '/data' do
          scope '/:name' do
            get '/' => 'info#getEMDBinfo'
          end
        end
        scope '/title' do
          scope '/:name' do
            get '/' => 'info#getEMDBtitle'
          end
        end
      end
      scope '/Uniprot' do
        scope '/:name' do
          get '/' => 'info#displayUniprotSequence'
        end
      end
      scope '/UniprotTitle' do
        scope '/:name' do
          get '/' => 'info#getUniprotTitle'
        end
      end
      scope '/PDB' do
        scope '/available' do
          scope '/:name' do
            get '/' => 'info#isPDBavailable'
          end
        end
        scope '/title' do
          scope '/:name' do
            get '/' => 'info#getPDBtitle'
          end
        end
      end
    end

    scope '/mappings' do
      scope '/EMDB' do
        scope '/PDB' do
          scope '/:name' do
            get '/' => 'mappings#getPDBsFromEMDB'
          end
        end
      end
      scope '/PDB' do
        scope '/EMDB' do
          scope '/:name' do
            get '/' => 'mappings#getEMDBFromPDBs'
          end
        end
      end
      scope '/Uniprot' do
        scope '/PDB' do
          scope '/:name' do
            get '/' => 'mappings#getPDBFromUniprot'
          end
        end
        scope '/ENSEMBL' do
          scope 'gene' do
            scope '/:name' do
              get '/' => 'mappings#getENSEMBLgeneFromUniprot'
            end
          end
          scope 'transcript' do
            scope '/:name' do
              get '/' => 'mappings#getENSEMBLtranscriptFromUniprot'
            end
          end
        end
      end
      scope '/PDB' do
        scope '/Uniprot' do
          scope '/:name' do
            get '/' => 'mappings#getUniprotFromPDB'
          end
        end
      end
    end

    scope '/alignments' do
      scope '/PDB' do
        scope '/:name' do
          get '/' => 'alignments#getPDBalignment'
        end
      end
      scope '/ENSEMBL' do
        scope '/:gene/:transcript/:acc' do
          get '/' => 'alignments_ensembl#getENSEMBLalignment'
        end
      end
      scope '/Coverage' do
        scope '/:name' do
          get '/' => 'alignments#getPDBcoverage'
        end
      end
      scope '/PDBjsonp' do
        scope '/:name' do
          get '/' => 'alignments#getPDBalignmentJSONP'
        end
      end
    end

    scope '/annotations' do
      scope '/ppi' do
        get '/job/:job_id' => 'job_status#check_status'
        post '/network' => 'annotations_ppi#getPOST'
        post '/custom' => 'annotations_ppi#getComplexCustomData'
        scope '/variants' do
          scope '/:name' do
            get '/' => 'annotations_ppi#getComplexVariants'
            post '/' => 'annotations_ppi#getComplexVariants'
          end
        end
        scope '/ptms' do
          scope '/:name' do
            get '/' => 'annotations_ppi#getComplexPTMs'
          end
        end
        scope '/pfam' do
          scope '/:name' do
            get '/' => 'annotations_ppi#getComplexPfam'
          end
        end
        scope '/interpro' do
          scope '/:name' do
            get '/' => 'annotations_ppi#getComplexInterPro'
          end
        end
        scope '/smart' do
          scope '/:name' do
            get '/' => 'annotations_ppi#getComplexSmart'
          end
        end
        scope '/epitopes' do
          scope '/:name' do
            get '/' => 'annotations_ppi#getComplexEpitopes'
          end
        end
        scope '/elms' do
          scope '/:name' do
            get '/' => 'annotations_ppi#getComplexELM'
          end
        end
      end
      scope '/PDB_REDO' do
        scope '/:name' do
          get '/' => 'annotations#getPDB_REDO'
        end
      end
      scope '/EBI' do
        scope '/:type' do
          scope '/:name' do
            get '/' => 'ebi_services#getEBIfeatures'
          end
        end
      end
      scope '/IEDB' do
        scope '/Uniprot' do
          scope '/:name' do
            get '/' => 'annotations#getIEDBfromUniprot'
          end
        end
      end
      scope '/Phosphosite' do
        scope '/Uniprot' do
          scope '/:name' do
            get '/' => 'annotations#getPhosphositeFromUniprot'
          end
        end
      end
      scope '/dbptm' do
        scope '/Uniprot' do
          scope '/:name' do
            get '/' => 'annotations#getDbptmFromUniprot'
          end
        end
      end
      scope '/biomuta' do
        scope '/Uniprot' do
          scope '/:name' do
            get '/' => 'annotations#getBiomutaFromUniprot'
          end
        end
      end
      scope '/dsysmap' do
        scope '/Uniprot' do
          scope '/:name' do
            get '/' => 'annotations#getDsysmapFromUniprot'
          end
        end
      end
      scope '/elmdb' do
        scope '/Uniprot' do
          scope '/:name' do
            get '/' => 'annotations#getELMDBfromUniprot'
          end
        end
      end
      scope '/Pfam' do
        scope '/Uniprot' do
          scope '/:name' do
            get '/' => 'annotations#getPfamFromUniprot'
          end
        end
      end
      scope '/SMART' do
        scope '/Uniprot' do
          scope '/:name' do
            get '/' => 'annotations#getSMARTfromUniprot'
          end
        end
      end
      scope '/mobi' do
        scope '/Uniprot' do
          scope '/:name' do
            get '/' => 'annotations#getMobiFromUniprot'
          end
        end
      end
      scope '/interpro' do
        scope '/Uniprot' do
          scope '/:name' do
            get '/' => 'annotations#getInterproFromUniprot'
          end
        end
      end
      scope '/ENSEMBL' do
        scope '/variation' do
          scope '/:name' do
            get '/' => 'annotations#getENSEMBLvariants'
          end
        end
        scope '/annotation' do
          scope '/:name' do
            get '/' => 'annotations#getENSEMBLannotations'
          end
        end
      end
    end
    scope '/lengths' do
      scope '/Uniprot' do
        scope '/:name' do
          get '/' => 'annotations#getUniprotLength'
        end
      end
      scope '/UniprotMulti' do
        scope '/:name' do
          get '/' => 'annotations#getUniprotMultipleSequences'
        end
      end
    end
  end

  get '*a', to: 'errors#routing'
end
