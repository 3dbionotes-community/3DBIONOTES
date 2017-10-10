module AlignmentsEnsemblManager
  module ToolsEnsembl
    module BuildGeneAaAlignment

      include ProteinManager::AlignSequences

      def buildGeneAAalignment(gene,transcripts)
        out = transcripts
        transcripts.each do |k,v|
          if v.key?('protein_id')
            out[k]['alignment'] = transcript_to_aa_alignment(gene,v)
          end
        end
        return out
      end

      def transcript_to_aa_alignment(gene,transcript)
        g2p = {}
        p2g = {}
        u2p = {}
        p2u = {}
        score = {}
        gene_exon_intervals = []
        gene_cds_intervals = []
        _strand = gene['strand']
        if _strand > 0
          _g_seq = gene['seq'].split("")
        else
          _g_seq = gene['seq'].reverse.split("")
        end
        _g_seq.unshift("*")
        _aa_seq = transcript['aa_seq'].split("")
        _g_l = _g_seq.length-1
        _g_s = gene['start']
        _g_e = gene['end']
        for i in 0..(transcript['exon'].length-1)
          #print "EXON #"+(i+1).to_s+"\n"
          e = transcript['exon'][i]
          _x = e['start']-_g_s
          _y = e['end']-_g_s
          gene_exon_intervals.push({'x'=>Integer(_x+1),'y'=>Integer(_y+1),'description'=>'EXON #'+(i+1).to_s})
          if e.key?('cds_start') and e.key?('cds_end')
            _x = e['cds_start']-_g_s
            _y = e['cds_end']-_g_s
            gene_cds_intervals.push({'x'=>Integer(_x+1),'y'=>Integer(_y+1)})
      
            #print Integer(_x+1).to_s+"\t"+Integer(_y+1).to_s+"<<<\n"
            #print "Exon #"+(i+1).to_s+"\t"+"SHIFT "+e['cds_phase'].to_s+"\n"
            _shift = Integer(e['cds_phase'])
            #print "EXON #"+(i+1).to_s+"\t"+e['cds_phase'].to_s+"\n"
            _aa_n = e['aa_start']
            #print _shift.to_s+"<-\n"
            if _shift > 0 and _aa_n<=_aa_seq.length
              #print "***\n"
              if i > 0
                e_prev = transcript['exon'][i-1]
                _n = []
                nn = []
                _shift = 3 - _shift
                for j in 0..(_shift-1)
                  n = 0.5*(1-_strand)*e_prev['cds_start']+0.5*(1+_strand)*e_prev['cds_end']-_strand*(_shift-1-j)
                  nn.push(n)
                  _x = n-_g_s
                  g2p[ Integer(_x+1) ] = _aa_n
                  _n.push( Integer(_x+1) )
                end
                _shift = 3 - _shift
                for j in 0..(_shift-1)
                  n = 0.5*(1-_strand)*e['cds_end']+0.5*(1+_strand)*e['cds_start']+_strand*j
                  nn.push(n)
                  _x = n-_g_s
                  g2p[ Integer(_x+1) ] = _aa_n
                  _n.push( Integer(_x+1) )
                end
                #print nn[0].to_s+","+nn[1].to_s+","+nn[2].to_s+"\t\t"+_n[0].to_s+","+_n[1].to_s+","+_n[2].to_s+"\t\t"+_g_seq[_n[0]]+_g_seq[_n[1]]+_g_seq[_n[2]]+"\t"+_aa_n.to_s+"\t"+_aa_seq[_aa_n-1]+"\n"
                p2g[_aa_n] = _n
              end
              _aa_n += 1
            end 
            _start = 0.5*(1-_strand)*e['cds_end']+0.5*(1+_strand)*e['cds_start']
            _end = 0.5*(1-_strand)*e['cds_start']+0.5*(1+_strand)*e['cds_end']
            n = _start+_shift*_strand
            #print n.to_s+":"+_end.to_s+"<--\n"
            while _strand*n+2 <= _strand*_end do
                _n = []
      
              if _aa_n<=_aa_seq.length
                _x = n-_g_s
                g2p[ Integer(_x+1) ] = _aa_n
                _n.push( Integer(_x+1) )
                #print "\t"+Integer(_x+1).to_s
      
                _x = (n+_strand)-_g_s
                g2p[ Integer(_x+1) ] = _aa_n
                _n.push( Integer(_x+1) )
                #print "\t"+Integer(_x+1).to_s
      
                _x = (n+2*_strand)-_g_s
                g2p[ Integer(_x+1) ] = _aa_n
                _n.push( Integer(_x+1) )

                p2g[_aa_n] = _n
                #print "\t"+Integer(_x+1).to_s+"\n"
      
                #print n.to_s+","+(n+_strand).to_s+","+(n+2*_strand).to_s+"\t\t"+_n[0].to_s+","+_n[1].to_s+","+_n[2].to_s+"\t\t"+_g_seq[_n[0]]+_g_seq[_n[1]]+_g_seq[_n[2]]+"\t"+_aa_n.to_s+"\t"+_aa_seq[_aa_n-1]+"\n"
                if _aa_n == _aa_seq.length
                  _e = gene_cds_intervals.pop()
                  #_x = e['cds_start']-_g_s
                  if _strand>0
                    gene_cds_intervals.push({'x'=>_e['x'],'y'=>_n[2]})
                  else
                    gene_cds_intervals.push({'x'=>_n[2],'y'=>_e['y']})
                  end
                end
                _aa_n += 1
              end
              n+=_strand*3
              #print "\t"+n.to_s+":"+_end.to_s+"<=\n"
              #print "\t\t"+_aa_n.to_s+"\n"
            end
      
            _exon_end = 0.5*(1-_strand)*e['start']+0.5*(1+_strand)*e['end']
            if _strand*(_end-n) < 2 and _strand*(_end-n)>=0 and _end==_exon_end and (i+1)<transcript['exon'].length and _aa_n<=_aa_seq.length
              _shift = _strand*(_end-n)+1
              e_next = transcript['exon'][i+1]
              _n = []
              nn = []
              for j in 0..(_shift-1)
                n = 0.5*(1-_strand)*e['cds_start']+0.5*(1+_strand)*e['cds_end']-_strand*(_shift-1-j)
                nn.push(n)
                _x = n-_g_s
                g2p[ Integer(_x+1) ] = _aa_n
                _n.push( Integer(_x+1) )
              end
              _shift = 3-_shift
              for j in 0..(_shift-1)
                n = 0.5*(1-_strand)*e_next['cds_end']+0.5*(1+_strand)*e_next['cds_start']+_strand*j
                nn.push(n)
                _x = n-_g_s
                g2p[ Integer(_x+1) ] = _aa_n
                _n.push( Integer(_x+1) )
              end

              p2g[_aa_n] = _n
              #print nn[0].to_s+","+nn[1].to_s+","+nn[2].to_s+"\t\t"+_n[0].to_s+","+_n[1].to_s+","+_n[2].to_s+"\t\t"+_g_seq[_n[0]]+_g_seq[_n[1]]+_g_seq[_n[2]]+"\t"+_aa_n.to_s+"\t"+_aa_seq[_aa_n-1]+"*\n"
              _aa_n += 1
            end
          end
        end
        if transcript.key?('uniprot_ref')
          uniprot_id = ''
          if transcript['uniprot_ref'].key?('Uniprot/SWISSPROT')
            uniprot_id = transcript['uniprot_ref']['Uniprot/SWISSPROT'][0]
          elsif transcript['uniprot_ref'].key?('Uniprot/SPTREMBL')
            uniprot_id = transcript['uniprot_ref']['Uniprot/SPTREMBL'][0]
          end
          uniprot_seq = gene[ 'uniprot_seq' ][ uniprot_id ]
          _align = align_sequences(uniprot_seq,transcript['aa_seq'])
          u2p = _align[0]
          p2u = _align[1]
          score = _align[2]
        end
        gene_uniprot_intervals = []
        gene_cds_intervals.each do |i|
          #print i['x'].to_s+"\t"+i['y'].to_s+"\n"
          if g2p.key?(i['x']) and g2p.key?(i['y'])
            #print g2p[i['x']].to_s+"\t"+g2p[i['y']].to_s+"<\n"
            if p2u[ g2p[i['x']] ]>0 and p2u[ g2p[i['y']] ]>0
              gene_uniprot_intervals.push({'x'=>i['x'],'y'=>i['y']})
            end
          end
        end
        return {'g2p'=>g2p,'p2g'=>p2g,'u2p'=>u2p,'p2u'=>p2u,'score'=>score,'gene_exon_intervals'=>gene_exon_intervals,'gene_cds_intervals'=>gene_cds_intervals,'gene_uniprot_intervals'=>gene_uniprot_intervals}
      end

    end 
  end
end
