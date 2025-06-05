module ProteinManager
  module AlignSequences

    require 'json'

    LocalPath = Settings.GS_LocalSeq
    IdentityMatrix = Settings.GS_IdentityMatrixFile

    def align_sequences(uniprot_seq,transcript_seq,_rand=nil)
      rand = _rand
      if rand.nil?
        rand = (0...20).map { ('a'..'z').to_a[rand(26)] }.join.upcase
      end

      File.write(LocalPath+rand+"_can_seq", uniprot_seq)
      File.write(LocalPath+rand+"_trans_seq", transcript_seq)
    
      cmd = "echo \"\n\" | water -asequence "+LocalPath+rand+"_can_seq -bsequence "+LocalPath+rand+"_trans_seq -gapopen 50 -gapextend 0 -datafile "+IdentityMatrix+" -aformat3 markx10 -stdout -aglobal3 Y -awidth3 1000000 2> /dev/null"
      begin 
        ws  = `#{cmd}`
        align = ws.split(/\>\s\.\.\s/)
    
        scores = align[0].split(/\n/)
        identity = scores[scores.length-2].sub(/;\ssw_ident:\s/,'')
        score = scores[scores.length-1].sub(/;\ssw_overlap:\s/,'')
    
        align1 = align[1].split(/\n/)
        start1 = Integer( align1[2].sub(/;\sal_start:\s/,'') )
        len1 = Integer( align1[0].sub(/;\ssq_len:\s/,'') )
        stop1 = Integer( align1[3].sub(/;\sal_stop:\s/,'') )
        seq1 = align1[5].split("")
    
        align2 = align[2].split(/\n/)
        align2.pop
        align2.pop
        start2 = Integer( align2[2].sub(/;\sal_start:\s/,'') )
        len2 = Integer( align2[0].sub(/;\ssq_len:\s/,'') )
        stop2 = Integer( align2[3].sub(/;\sal_stop:\s/,'') )
        seq2 = align2[5].split("")
    
        if seq1.length != seq2.length
          abort("FATAL ERROR - prepare to DIE!!!")
        end
    
        n = seq1.length;
    
        can2trans = []
        trans2can = []
        pdb_seq = ''
    
        for i in 0..(start1-1)
          can2trans[i] = -1
          pdb_seq += '-'
        end
        pdb_seq = pdb_seq.chop
    
        for i in 0..(start2-1)
          trans2can[i] = -1
        end
    
        i1 = start1
        i2 = start2
    
        for i in 0..(n-1)
          if seq1[i] != '-' and seq2[i] != '-' 
            can2trans[i1] = i2
            trans2can[i2] = i1
            pdb_seq += seq2[i]
          end
          if seq1[i] == '-' 
            trans2can[i2] = -1
          end
          if seq2[i] == '-' 
            can2trans[i1] = -1
            pdb_seq += '-'
          end
          if seq1[i] != '-' 
            i1 += 1
          end
          if seq2[i] != '-' 
            i2 += 1
          end
        end
    
        for i in (stop1+1)..len1
          can2trans[i] = -1
          pdb_seq += '-'
        end
        for i in (stop2+1)..len2
          trans2can[i] = -1
        end
    
        system("rm "+LocalPath+rand+"_can_seq")
        system("rm "+LocalPath+rand+"_trans_seq")
    
        return [can2trans,trans2can,{'score'=>score,'identity'=>identity, 'pdb_seq'=>pdb_seq}]
      rescue Exception => e  
        raise "cmd "+cmd+"\nMessage: "+e.message+"\nTrace: "+JSON.parse(e.backtrace.inspect).join("\n")
      end
    end

  end
end
