module FramesAnnotationsManager
  module FramesAnnotationsTools

    include ProteinManager::AlignSequences
    def align_sequences_fat( uniprot_seq, imported_seq )
      can2trans,trans2can,data = align_sequences( uniprot_seq, imported_seq )
      pdb_seq = data['pdb_seq']
  
      out = { 'mapping'=>[], 'inverse'=>{}, 'uniprotSeq'=>uniprot_seq, 'importedSeq'=>pdb_seq, 'coverage'=>[] }
  
      (0..(uniprot_seq.length-1)).each do |i|
        if can2trans[i+1]>0
          out['mapping'].push({'importedIndex': can2trans[i+1] })
          out['inverse'][ can2trans[i+1] ] = i+1
        else
          out['mapping'].push({})
        end
      end
  
      cover_start = 0
      cover_end = 0
      (0..(pdb_seq.length-1)).each do |i|
        if !trans2can[i+1].nil? && trans2can[i+1]>0 && cover_start == 0
          cover_start = i+1
        elsif !trans2can[i+1].nil? && trans2can[i+1] < 0 && cover_start > 0
          out['coverage'].push({'begin'=>cover_start, 'end'=>i })
          cover_start = 0
        elsif i == pdb_seq.length-1 && cover_start > 0
          out['coverage'].push({'begin'=>cover_start, 'end'=>i })
        end
      end
  
      return out
    end 

  end
end
