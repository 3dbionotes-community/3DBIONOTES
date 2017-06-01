class FramesAnnotationsController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"
  LocalPath =  "/home/joan/apps/bionotes/data/tmp_seq/"
  UniprotURL = "http://www.uniprot.org/uniprot/"

  helper_method :getUrl
  helper FramesHelper

  def getUrl(url)
    starts = Time.now.to_i
    verbose = 0 
    data = ""
    if params[:debug_id]
      data = Net::HTTP.get_response(URI.parse("http://3dbionotes.cnb.csic.es:8000/?debug_id="+params[:debug_id]+"&message=iannotationsIFrame::"+url)).body
      puts data
    end
    if params[:verbose] or request.port==3000
      verbose = 1
    end
    if verbose == 1
      puts "\n\n==========================================================\n"
      puts url
      puts "==========================================================\n\n"
    end
    begin
      uri = URI.parse(url)
      request = Net::HTTP.start(uri.host, uri.port) do |http|
        http.read_timeout = 6
        http.get(uri)
      end
      data = request.body
    rescue
      puts "Error downloading data:\n#{$!}"
      data = '[]'
    end
    if verbose == 1
      puts "\n\n==========================================================\nDONE\n==========================================================\n\n"
    end
    if data.length == 0
      data = '[]'
    end 
    ends = Time.now.to_i
    total = ends-starts
    @log += "console.log('"+url+" - "+total.to_s+"s');"
    return data
  end

  def annotationsIFrame
    alignment = params[:alignment]
    @imported_flag = false 
    if !alignment.nil?
      @alignment = JSON.parse(alignment)
      @annotsData = Hash.new
      @generalData = Hash.new
      @log = ""
      if !@alignment["uniprot"].nil?
        @uniprotACC = @alignment["uniprot"]
        @allURL = []
        @allURL.push(["iedb","/api/annotations/IEDB/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["phosphosite", "/api/annotations/Phosphosite/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["dbptm", "/api/annotations/dbptm/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["biomuta", "/api/annotations/biomuta/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["dsysmap", "/api/annotations/dsysmap/Uniprot/"+@alignment["uniprot"],true])
        if @alignment["pdb"] and not @alignment["path"]
	  @allURL.push(["coverage", "/api/alignments/Coverage/"+@alignment["pdb"].downcase+@alignment["chain"],false])
        elsif @alignment["pdb"] and @alignment["path"]
          @allURL.push(["coverage", "/api/alignments/Coverage/"+@alignment["path"]+"::"+@alignment["pdb"].gsub!('.', '_dot_')+"::"+@alignment["chain"],false])
        end
        @allURL.push(["elmdb", "/api/annotations/elmdb/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["Pfam", "/api/annotations/Pfam/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["mobi", "/api/annotations/mobi/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["smart", "/api/annotations/SMART/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["interpro", "/api/annotations/interpro/Uniprot/"+@alignment["uniprot"],true])
      end
    end
    @allURL = @allURL.to_json
  end

  def imported_annotationsIFrame
    import_acc = params[:imported_acc]
    alignment = params[:alignment]
    @imported_flag = true
    if !alignment.nil?
      @alignment = JSON.parse(alignment)
      @annotsData = Hash.new
      @generalData = Hash.new
      @log = ""

      if !@alignment["uniprot"].nil?
        sequences = getUniprotMultipleSequences(@alignment["uniprot"]+","+import_acc)
        @imported_alignment = align_sequences(sequences[ @alignment['uniprot'] ]['sequence'],sequences[ import_acc ]['sequence'])
        @imported_alignment['imported_acc'] = import_acc
        @uniprotACC = import_acc
        @uniprotTitle = sequences[import_acc]['definition']
        @organism = sequences[import_acc]['organism']
        @gene_symbol = sequences[import_acc]['gene_symbol']

        @alignment['organism'] = @organism
        @alignment['original_uniprot'] = @alignment['uniprot']
        @alignment['uniprot'] = import_acc
        @alignment['uniprotTitle'] = @uniprotTitle
        @alignment['uniprotLength'] = sequences[ import_acc ]['sequence'].length
        @alignment['gene_symbol'] = @gene_symbol

        @allURL = []
        @allURL.push(["iedb","/api/annotations/IEDB/Uniprot/"+import_acc,true])
        @allURL.push(["phosphosite", "/api/annotations/Phosphosite/Uniprot/"+import_acc,true])
        @allURL.push(["dbptm", "/api/annotations/dbptm/Uniprot/"+import_acc,true])
        @allURL.push(["biomuta", "/api/annotations/biomuta/Uniprot/"+import_acc,true])
        @allURL.push(["dsysmap", "/api/annotations/dsysmap/Uniprot/"+import_acc,true])
        @allURL.push(["elmdb", "/api/annotations/elmdb/Uniprot/"+import_acc,true])
        @allURL.push(["Pfam", "/api/annotations/Pfam/Uniprot/"+import_acc,true])
        @allURL.push(["mobi", "/api/annotations/mobi/Uniprot/"+import_acc,true])
        @allURL.push(["smart", "/api/annotations/SMART/Uniprot/"+import_acc,true])
        @allURL.push(["interpro", "/api/annotations/interpro/Uniprot/"+import_acc,true])
      end
    end
    @allURL = @allURL.to_json
  end

  def getUniprotMultipleSequences( uniprotAc )
    returnValue = {}
    begin
      if uniprotAc.split(",").length > 1
        data = Net::HTTP.get_response(URI.parse(UniprotURL+"?query="+uniprotAc+"&format=fasta"))
      else
        data = Net::HTTP.get_response(URI.parse(UniprotURL+uniprotAc+".fasta"))
      end
    rescue
      puts "Error: #{$!}"
    end
    fasta = nil
    if data.code != "404"
      fasta = Bio::Alignment::MultiFastaFormat.new( data.body )
    end
    fasta.entries.each do |entry|
      aux = entry.definition.split(/\|/)[2].split(/\sOS=/)
      entry_definition = aux[0].split(/\s/,2)[1]
      aux = aux[1].split(/ GN=/,2)
      organism_name = aux[0]
      if !aux[1].nil?
        gene_symbol = aux[1].split(/ PE=/,2)[0]
      else
        gene_symbol = "N/A"
      end
      returnValue[ entry.accession ] = {'sequence'=>entry.seq,'definition'=>entry_definition,'organism'=>organism_name, 'gene_symbol'=>gene_symbol}
    end
    return returnValue 
  end

  def align_sequences( uniprot_seq, imported_seq )
    rand = (0...20).map { ('a'..'z').to_a[rand(26)] }.join.upcase
    File.write(LocalPath+"/"+rand+"_can_seq", uniprot_seq)
    File.write(LocalPath+"/"+rand+"_trans_seq", imported_seq)
  
    cmd = "echo \"\n\" | water -asequence "+LocalPath+"/"+rand+"_can_seq -bsequence "+LocalPath+"/"+rand+"_trans_seq -gapopen 50 -gapextend 0 -datafile /home/joan/tools/ENSEMBL/IDENTITY -aformat3 markx10 -stdout -aglobal3 Y -awidth3 1000000 2> /dev/null" 

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

    system("rm "+LocalPath+"/"+rand+"_can_seq")
    system("rm "+LocalPath+"/"+rand+"_trans_seq")
    return out
  end
end
