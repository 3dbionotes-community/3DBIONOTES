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
        _n = 0
        _ids.each do |k,v|
          ids += k+','
          _n += 1
        end
        ids = ids.chomp(',')
        if _n > 1
          _seq = fetchUniprotMultipleSequences(ids,fasta_obj_flag=true)
        else
          _seq = fetchUniprotMultipleSequences(ids,fasta_obj_flag=true)
        end
        out = {}
        _seq.entries.each do |entry|
          out[ entry.accession ] = entry.seq
        end
        return out
      end

    end 
  end
end
