class AlignmentsEnsemblController < ApplicationController

  Server='http://rest.ensembl.org'
  UniServer = 'http://www.uniprot.org'

  helper_method :makeRequest
  helper_method :xref
  helper_method :lookup
  helper_method :sequence
  helper_method :translation_exon
  helper_method :uniprot_ref
  helper_method :uniprot_seq
  helper_method :gene_to_aa_alignment
  helper_method :align_isoform
  helper_method :transcript_to_aa_alignment
  helper_method :merge_exon_info
  helper_method :exon_cds
  helper_method :ensembl_aligment
  helper_method :ensembl_data_transcript_viewer

  $verbose = 0

  def makeRequest(path,server=Server)
    url = URI.parse(server)
    if request.port==3000
      puts "\n\n==========================================================\n"
      puts url
      puts "==========================================================\n\n"
    end
    http = Net::HTTP.new(url.host, url.port)
    if request.port==3000
      puts "\n\n==========================================================\nDONE\n==========================================================\n\n"
    end
    request = Net::HTTP::Get.new(path, {'Content-Type' => 'application/json'})
    response = http.request(request)
    if response.code != "200"
      puts "Invalid response: #{response.code}"
      puts response.body
      return nil
    end
    if server == UniServer
      fasta = Bio::Alignment::MultiFastaFormat.new(response.body)
      return fasta
    end
    return JSON.parse(response.body)
  end
    
  def xref(id)
    path = '/xrefs/id/'+id+'?all_levels=1;external_db=uniprot%;content-type=application/json'
    return makeRequest(path)
  end
  
  def lookup(id)
    path = '/lookup/id/'+id
    return makeRequest(path)
  end
  
  def sequence(id)
    path = '/sequence/id/'+id
    return makeRequest(path)
  end
  
  def translation_exon(id)
    path = '/overlap/translation/'+id+'?content-type=application/json;feature=translation_exon'
    return makeRequest(path)
  end
  
  def uniprot_ref(id)
    refs = xref(id)
    out = {}
    refs.each do |r|
      if not out.key?(r['dbname'])
        out[ r['dbname'] ] = []
      end
      out[ r['dbname'] ].push( r['primary_id'] )
    end
    return out
  end
  
  def uniprot_seq(transcripts,uniprot_acc=nil)
    __ids = {}
    transcripts.each do |k,t|
      if t.key?('uniprot_ref')
        if t['uniprot_ref'].key?('Uniprot/SWISSPROT')
          __ids[ t['uniprot_ref']['Uniprot/SWISSPROT'][0] ] = 1
        elsif t['uniprot_ref'].key?('Uniprot/SPTREMBL')
          __ids[ t['uniprot_ref']['Uniprot/SPTREMBL'][0] ] = 1
        end
      end
    end
    ids = ''
    __n = 0
    __ids.each do |k,v|
      ids += k+','
      __n += 1
    end
    ids = ids.chomp(',')
    if __n > 1
      __seq = makeRequest('/uniprot/?query='+ids+'&format=fasta',UniServer)
    else
      __seq = makeRequest('/uniprot/'+ids+'.fasta',UniServer)
    end
    out = {}
    __seq.entries.each do |entry|
      out[ entry.accession ] = entry.seq
    end
    return out
  end
  
  def gene_to_aa_alignment(gene,transcripts)
    out = transcripts
    transcripts.each do |k,v|
      if v.key?('protein_id')
        out[k]['alignment'] = transcript_to_aa_alignment(gene,v)
      end
    end
    return out
  end
  
  def align_isoform(uniprot_seq,transcript_seq)
    File.write("/tmp/can_seq", uniprot_seq)
    File.write("/tmp/trans_seq", transcript_seq)
  
    ws = `echo "\n" | water -asequence /tmp/can_seq -bsequence /tmp/trans_seq -gapopen 50 -gapextend 0 -datafile /home/joan/tools/ENSEMBL/IDENTITY -aformat3 markx10 -stdout -aglobal3 Y -awidth3 1000000 2> /dev/null`
  
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
  
    for i in 0..(start1-1)
  	can2trans[i] = -1
    end
  
    for i in 0..(start2-1)
  	trans2can[i] = -1
    end
  
    i1 = start1
    i2 = start2
  
    for i in 0..(n-1)
      if seq1[i] != '-' and seq2[i] != '-' 
        can2trans[i1] = i2
        trans2can[i2] = i1
      end
      if seq1[i] == '-' 
        trans2can[i2] = -1
      end
      if seq2[i] == '-' 
        can2trans[i1] = -1
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
    end
    for i in (stop2+1)..len2
      trans2can[i] = -1
    end
    return [can2trans,trans2can,{'score'=>score,'identity'=>identity}]
  end
  
  def transcript_to_aa_alignment(gene,transcript)
    g2p = {}
    p2g = {}
    u2p = {}
    p2u = {}
    score = {}
    gene_exon_intervals = []
    gene_cds_intervals = []
    __strand = gene['strand']
    if __strand > 0
      __g_seq = gene['seq'].split("")
    else
      __g_seq = gene['seq'].reverse.split("")
    end
    __g_seq.unshift("*")
    __aa_seq = transcript['aa_seq'].split("")
    __g_l = __g_seq.length-1
    __g_s = gene['start']
    __g_e = gene['end']
    for i in 0..(transcript['exon'].length-1)
      #print "EXON #"+(i+1).to_s+"\n"
      e = transcript['exon'][i]
      __x = e['start']-__g_s
      __y = e['end']-__g_s
      gene_exon_intervals.push({'x'=>Integer(__x+1),'y'=>Integer(__y+1),'description'=>'EXON #'+(i+1).to_s})
      if e.key?('cds_start') and e.key?('cds_end')
        __x = e['cds_start']-__g_s
        __y = e['cds_end']-__g_s
        gene_cds_intervals.push({'x'=>Integer(__x+1),'y'=>Integer(__y+1)})
  
        #print Integer(__x+1).to_s+"\t"+Integer(__y+1).to_s+"<<<\n"
        #print "Exon #"+(i+1).to_s+"\t"+"SHIFT "+e['cds_phase'].to_s+"\n"
        __shift = Integer(e['cds_phase'])
        #print "EXON #"+(i+1).to_s+"\t"+e['cds_phase'].to_s+"\n"
        __aa_n = e['aa_start']
        #print __shift.to_s+"<-\n"
        if __shift > 0 and __aa_n<=__aa_seq.length
          #print "***\n"
          if i > 0
            e_prev = transcript['exon'][i-1]
            __n = []
            nn = []
            __shift = 3 - __shift
            for j in 0..(__shift-1)
              n = 0.5*(1-__strand)*e_prev['cds_start']+0.5*(1+__strand)*e_prev['cds_end']-__strand*(__shift-1-j)
              nn.push(n)
              __x = n-__g_s
              g2p[ Integer(__x+1) ] = __aa_n
              __n.push( Integer(__x+1) )
            end
            __shift = 3 - __shift
            for j in 0..(__shift-1)
              n = 0.5*(1-__strand)*e['cds_end']+0.5*(1+__strand)*e['cds_start']+__strand*j
              nn.push(n)
              __x = n-__g_s
              g2p[ Integer(__x+1) ] = __aa_n
              __n.push( Integer(__x+1) )
            end
            #print nn[0].to_s+","+nn[1].to_s+","+nn[2].to_s+"\t\t"+__n[0].to_s+","+__n[1].to_s+","+__n[2].to_s+"\t\t"+__g_seq[__n[0]]+__g_seq[__n[1]]+__g_seq[__n[2]]+"\t"+__aa_n.to_s+"\t"+__aa_seq[__aa_n-1]+"\n"
            p2g[__aa_n] = __n
          end
          __aa_n += 1
        end 
        __start = 0.5*(1-__strand)*e['cds_end']+0.5*(1+__strand)*e['cds_start']
        __end = 0.5*(1-__strand)*e['cds_start']+0.5*(1+__strand)*e['cds_end']
        n = __start+__shift*__strand
        #print n.to_s+":"+__end.to_s+"<--\n"
        while __strand*n+2 <= __strand*__end do
            __n = []
  
          if __aa_n<=__aa_seq.length
            __x = n-__g_s
            g2p[ Integer(__x+1) ] = __aa_n
            __n.push( Integer(__x+1) )
            #print "\t"+Integer(__x+1).to_s
  
            __x = (n+__strand)-__g_s
            g2p[ Integer(__x+1) ] = __aa_n
            __n.push( Integer(__x+1) )
            #print "\t"+Integer(__x+1).to_s
  
            __x = (n+2*__strand)-__g_s
            g2p[ Integer(__x+1) ] = __aa_n
            __n.push( Integer(__x+1) )

            p2g[__aa_n] = __n
            #print "\t"+Integer(__x+1).to_s+"\n"
  
            #print n.to_s+","+(n+__strand).to_s+","+(n+2*__strand).to_s+"\t\t"+__n[0].to_s+","+__n[1].to_s+","+__n[2].to_s+"\t\t"+__g_seq[__n[0]]+__g_seq[__n[1]]+__g_seq[__n[2]]+"\t"+__aa_n.to_s+"\t"+__aa_seq[__aa_n-1]+"\n"
            if __aa_n == __aa_seq.length
              __e = gene_cds_intervals.pop()
              #__x = e['cds_start']-__g_s
              if __strand>0
                gene_cds_intervals.push({'x'=>__e['x'],'y'=>__n[2]})
              else
                gene_cds_intervals.push({'x'=>__n[2],'y'=>__e['y']})
              end
            end
            __aa_n += 1
          end
          n+=__strand*3
          #print "\t"+n.to_s+":"+__end.to_s+"<=\n"
          #print "\t\t"+__aa_n.to_s+"\n"
        end
  
        __exon_end = 0.5*(1-__strand)*e['start']+0.5*(1+__strand)*e['end']
        if __strand*(__end-n) < 2 and __strand*(__end-n)>=0 and __end==__exon_end and (i+1)<transcript['exon'].length and __aa_n<=__aa_seq.length
          __shift = __strand*(__end-n)+1
          e_next = transcript['exon'][i+1]
          __n = []
          nn = []
          for j in 0..(__shift-1)
            n = 0.5*(1-__strand)*e['cds_start']+0.5*(1+__strand)*e['cds_end']-__strand*(__shift-1-j)
            nn.push(n)
            __x = n-__g_s
            g2p[ Integer(__x+1) ] = __aa_n
            __n.push( Integer(__x+1) )
          end
          __shift = 3-__shift
          for j in 0..(__shift-1)
            n = 0.5*(1-__strand)*e_next['cds_end']+0.5*(1+__strand)*e_next['cds_start']+__strand*j
            nn.push(n)
            __x = n-__g_s
            g2p[ Integer(__x+1) ] = __aa_n
            __n.push( Integer(__x+1) )
          end

          p2g[__aa_n] = __n
          #print nn[0].to_s+","+nn[1].to_s+","+nn[2].to_s+"\t\t"+__n[0].to_s+","+__n[1].to_s+","+__n[2].to_s+"\t\t"+__g_seq[__n[0]]+__g_seq[__n[1]]+__g_seq[__n[2]]+"\t"+__aa_n.to_s+"\t"+__aa_seq[__aa_n-1]+"*\n"
          __aa_n += 1
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
      __align = align_isoform(uniprot_seq,transcript['aa_seq'])
      u2p = __align[0]
      p2u = __align[1]
      score = __align[2]
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
  
  def merge_exon_info(info)
    out = Hash.new
    info.each do |k,v|
      out[k] = Hash.new
      v.each do |i,j|
        out[k][i] = j
      end
      __exons = []
      if v.key?('protein_id')
        if v['cds'].length != v['translation_exons'].length
          abort("!!!")
        end
        out[k]['exon'].each do |e|
          if( Integer(e['ensembl_end_phase'])>-1 || Integer(e['ensembl_phase'])>-1)
            __cds = v['cds'].shift
            __te = v['translation_exons'].shift
            e['cds_start'] = __cds['start']
            e['cds_end'] = __cds['end']
            e['cds_phase'] = __cds['phase']
            e['aa_start'] = __te['start']
            e['aa_end'] = __te['end']
          end
          __exons.push(e)
        end
        out[k]['exon'] = __exons
      end
    end
    return out
  end
  
  def exon_cds(id,transcript_id,uniprot_acc=nil)
    path = '/overlap/id/'+id+'?feature=exon;feature=cds;content-type=application/json'
    req = makeRequest(path)
    out = Hash.new
    req.each do |i|
      if i['Parent'] == transcript_id
        if not out.key?(i['Parent'])
          out[ i['Parent'] ] = {'cds'=>[],'exon'=>[]}
        end
        if not out[ i['Parent'] ].key?('protein_id') and i.key?('protein_id')
          out[ i['Parent'] ][ 'protein_id' ] = i['protein_id']
          __aa_sequence = sequence( i['protein_id'] )
          out[ i['Parent'] ]['aa_seq'] = __aa_sequence['seq']
          __trans_exons = translation_exon( i['protein_id'] )
          out[ i['Parent'] ]['translation_exons'] = __trans_exons
          if uniprot_acc
            __uniprot_ref = {'Uniprot/SPTREMBL'=>[uniprot_acc]}
          else
            __uniprot_ref = uniprot_ref( i['Parent'] )
          end
          out[ i['Parent'] ]['uniprot_ref'] = __uniprot_ref
        end
        out[ i['Parent'] ][ i['feature_type'] ].push(i)
      end
    end
    out = merge_exon_info(out)
    return out
  end
  
  def ensembl_aligment(ensembl_gene_id,ensembl_transcript_id,uniprot_acc=nil)
    transcripts = exon_cds( ensembl_gene_id,ensembl_transcript_id,uniprot_acc )
    gene = lookup( ensembl_gene_id )
    __sequence = sequence( ensembl_gene_id )
    gene['seq'] = __sequence['seq']
    gene['uniprot_seq'] = uniprot_seq(transcripts)
    transcripts = gene_to_aa_alignment( gene,transcripts )
    return {'gene'=>gene,'transcripts'=>transcripts}
  end
  
  def ensembl_data_transcript_viewer(ensembl_gene_id,ensembl_transcript_id,uniprot_acc=nil)
    if $verbose == 1
      puts "RUNNING ensembl_aligment\n"
    end
    gene = ensembl_aligment(ensembl_gene_id,ensembl_transcript_id,uniprot_acc)
    if $verbose == 1
      puts "\tDONE\n"
    end
    transcript = gene['transcripts'][ ensembl_transcript_id ]
    aa_seq = transcript['aa_seq'].split(//)
    aa_seq.unshift("*")
    transcript_peptide_seq = "";
    last_e = {}
    transcript['exon'].each do |e|
      if not e.key?('cds_phase')
        last_e = e
        next
      end
      phase = Integer(e['cds_phase'])
      if phase >= 1
        phase = 1+0.5*(1-gene['gene']['strand'])
      else 
        phase = 0
      end
  
      if last_e.key?('cds_end') and e.key?('cds_start')
        __n = 0.5*(1+gene['gene']['strand'])*(e['cds_start']-last_e['cds_end']-phase)+0.5*(1-gene['gene']['strand'])*(last_e['cds_start']-e['cds_end'])
        transcript_peptide_seq += " "*(Integer(__n)-phase)
      elsif e.key?('cds_start')
        __n = 0.5*(1+gene['gene']['strand'])*(e['cds_start']-gene['gene']['start'])+0.5*(1-gene['gene']['strand'])*(gene['gene']['end']-e['cds_end'])
        transcript_peptide_seq += " "*(Integer(__n))
      else
        last_e = e
        next
      end
      gap = ""
      if not Integer(e[ 'cds_phase' ]) > 0
        gap = " "
      end
      transcript_peptide_seq += gap+aa_seq[e['aa_start']..e['aa_end']].join("  ")
      last_e = e
    end
    transcript_peptide_seq += " "*(gene['gene']['seq'].length-transcript_peptide_seq.length)
    if gene['gene']['strand'] < 0
      gene['gene']['neg_seq']=gene['gene']['seq'].reverse
      gene['gene']['pos_seq']=Bio::Sequence.auto( gene['gene']['neg_seq'] ).reverse_complement.to_s.reverse.upcase
      transcript_peptide_seq = transcript_peptide_seq.reverse
    else
      gene['gene']['pos_seq'] = gene['gene']['seq']
      gene['gene']['neg_seq']=Bio::Sequence.auto( gene['gene']['pos_seq'] ).reverse_complement.to_s.reverse.upcase
    end
    return {'transcript'=>transcript,'gene'=>gene['gene'],'aa_seq'=>transcript_peptide_seq}
    #return {'gene_exon_intervals'=>transcript['alignment']['gene_exon_intervals'],'gene_uniprot_intervals'=>transcript['alignment']['gene_uniprot_intervals'],'gene_seq'=>gene['gene']['seq'],'aa_seq'=>transcript_peptide_seq}
  end

  def getENSEMBLalignment
    gene_id = params[:gene].upcase
    transcript_id = params[:transcript].upcase
    acc = params[:acc].upcase

    myStatus = :ok
    return render json: ensembl_data_transcript_viewer(gene_id,transcript_id,acc), status: myStatus
  end
  
end
