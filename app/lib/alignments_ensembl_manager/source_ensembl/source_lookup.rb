module AlignmentsEnsemblManager
  module SourceEnsembl
    module SourceLookup
      
      include EnsemblSites
      include GlobalTools::FetchParserTools

      def sourceLookUp( ensembl_id )
        path = '/lookup/id/'+ensembl_id
        return makeRequest( EnsemblServer,path,json_flag=true )
      end

    end 
  end
end
