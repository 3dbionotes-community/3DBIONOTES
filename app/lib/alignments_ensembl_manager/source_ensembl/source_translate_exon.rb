module AlignmentsEnsemblManager
  module SourceEnsembl
    module SourceTranslateExon
      
      include EnsemblSites
      include GlobalTools::FetchParserTools

      def sourceTranslateExon(exon_id)
        path = '/overlap/translation/'+exon_id+'?content-type=application/json;feature=translation_exon'
        return makeRequest(EnsemblServer,path,json_flag=true)
      end

    end 
  end
end
