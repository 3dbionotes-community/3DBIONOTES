module AlignmentsEnsemblManager
  module SourceEnsembl
    module SourceSequence 
      
      include EnsemblSites
      include GlobalTools::FetchParserTools

      def sourceSequence(ensembl_id)
        path = '/sequence/id/'+ensembl_id
        return makeRequest(EnsemblServer,path,json_flag=true)
      end

    end 
  end
end
