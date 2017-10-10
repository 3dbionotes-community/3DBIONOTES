module AlignmentsEnsemblManager
  module SourceEnsembl
    module SourceExonCds 
      
      include EnsemblSites
      include GlobalTools::FetchParserTools

      def sourceExonCDS(ensembl_id)
        path = '/overlap/id/'+ensembl_id+'?feature=exon;feature=cds;content-type=application/json'
        return makeRequest(EnsemblServer,path,json_flag=true)
      end

    end 
  end
end
