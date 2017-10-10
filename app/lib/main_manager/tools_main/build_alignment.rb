module MainManager
  module ToolsMain
    module BuildAlignment
    
      include ProteinManager::AlignSequences
      def align_sequences_mc(uniprot_seq, ch_seq, mapping,rand)
        can2trans,trans2can,data = align_sequences(uniprot_seq, ch_seq, _rand=rand)
        pdb_seq = data['pdb_seq']
        out = { 'mapping'=>[], 'inverse'=>{}, 'uniprotSeq'=>uniprot_seq, 'pdbSeq'=>pdb_seq }
        (0..(uniprot_seq.length-1)).each do |i|
          if can2trans[i+1]>0
            out['mapping'].push({'pdbIndex':mapping[ can2trans[i+1]-1 ]})
            out['inverse'][ mapping[ can2trans[i+1]-1 ] ] = i+1
          else
            out['mapping'].push({})
          end
        end
        return out
      end

    end
  end
end
