module AlignmentsEnsemblManager
  module SourceEnsembl
    module SourceUniprotRef 
      
      include EnsemblSites
      include GlobalTools::FetchParserTools

      def xref(ensembl_id)
        path = '/xrefs/id/'+ensembl_id+'?all_levels=1;external_db=uniprot%;content-type=application/json'
        return makeRequest(EnsemblServer,path,json_flag=true)
      end

      def sourceUniprotRef(ensembl_id)
        refs = xref(ensembl_id)
        out = {}
        refs.each do |r|
          if not out.key?(r['dbname'])
            out[ r['dbname'] ] = []
          end
          out[ r['dbname'] ].push( r['primary_id'] )
        end
        return out
      end

    end 
  end
end
