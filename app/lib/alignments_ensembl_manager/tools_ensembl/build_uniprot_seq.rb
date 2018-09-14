module AlignmentsEnsemblManager
  module ToolsEnsembl
    module BuildUniprotSeq

      include GlobalTools::FetchParserTools
      include ProteinManager::FetchSequenceInfo

      def buildUniProtSeq(transcripts,uniprot_acc=nil)
        _ids = {}
        transcripts.each do |k,t|
          if t.key?('uniprot_ref')
            if t['uniprot_ref'].key?('Uniprot/SWISSPROT')
              _ids[ t['uniprot_ref']['Uniprot/SWISSPROT'][0] ] = 1
            elsif t['uniprot_ref'].key?('Uniprot/SPTREMBL')
              _ids[ t['uniprot_ref']['Uniprot/SPTREMBL'][0] ] = 1
            end
          end
        end
        ids = ''
        _ids.each do |k,v|
          ids += k+','
        end
        ids = ids.chomp(',')
        _seq = fetchUniprotMultipleSequences(ids,fasta_obj_flag=nil,dict_flag=true)
        out = {}
        _seq.each do |acc,entry|
          out[ acc ] = entry['sequence']
        end
        return out
      end

    end 
  end
end
