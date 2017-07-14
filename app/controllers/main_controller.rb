class MainController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"
  LocalPath =  "/home/joan/apps/bionotes/public/upload/"
  
  helper_method :getAlignments
  helper_method :getUrl

  def getUrl(url)
    starts = Time.now.to_i
    begin
      verbose = 0
      if verbose == 1
        puts "\n\n==========================================================\n"
        puts url
        puts "==========================================================\n\n"
      end
      data = Net::HTTP.get_response(URI.parse(url)).body
    rescue
      puts "Error downloading data:\n#{$!}"
    end
    ends = Time.now.to_i
    total = ends-starts
    @log += "console.log('"+url+" - "+total.to_s+"s');"
    return data
  end  

  def getAlignments(pdbList)
    alignList = {}
    pdbList.each do |pdb|
      url = BaseUrl+"api/alignments/PDB/"+pdb
      jsonData = getUrl(url)
      mappingData = JSON.parse(jsonData)
      alignList[pdb]=mappingData
    end
    ends = Time.now.to_i
    total = ends-starts
    @log += "console.log('getAlignments - "+total.to_s+"s');"
    return alignList
  end

  def home
    @log = ""
    @title = "Home"
    @noAlignments = false
    if !params[:viewer_type].nil? and params[:viewer_type]=="chimera"
      @viewerType = "chimera"
    elsif !params[:viewer_type].nil? and params[:viewer_type]=="jsmol"
      @viewerType = "jsmol"
    else
      @viewerType = "ngl"
    end
    identifierName = params[:queryId]
    if identifierName != nil
      if identifierName.upcase =~ /^EMD-\d{4}$/
        identifierName.upcase!
        identifierType = "EMDB"
      elsif identifierName.downcase =~ /^\d{1}\w{3}$/ and identifierName.downcase !~ /^\d{4}$/
        identifierName.downcase!
        identifierType = "PDB"
      elsif identifierName.upcase =~ /^[OPQ][0-9][A-Z0-9]{3}[0-9]$|^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/
        identifierName.upcase!
        identifierType = "Uniprot"
      else
        identifierType = nil
        @notExists = true 
      end
    end
    @identifierName = identifierName
    @identifierType = identifierType
    @isAvailable = true
    if !identifierType.nil? and !identifierName.nil?
      identifierName.strip!
      @changeSelector = false
      @badName = true
      @notExists = true
      @isAvailable = false
      @emdb = ""
      if identifierType=="EMDB"
        #chequear si el EMDB es valido
        if identifierName =~ /^EMD-\d{4}$/
          url = BaseUrl+"api/info/EMDB/available/"+identifierName
          jsonData = getUrl(url)
          if !jsonData.nil?
            availJson  = JSON.parse(jsonData)
          else
            availJson = nil
          end
          if !availJson.nil? and  availJson["available"]
            @isAvailable = true
          end
          url = BaseUrl+"api/info/EMDB/title/"+identifierName
          jsonData = getUrl(url)
          titleJson = JSON.parse(jsonData)
          @moleculeTitle = titleJson["title"]
          @badName = false
          options = Hash.new
          url = BaseUrl+"api/mappings/EMDB/PDB/"+identifierName
          jsonData = getUrl(url)
          pdbData = JSON.parse(jsonData)
          if pdbData.has_key?(identifierName)
            @notExists = false 
            pdbs = pdbData[identifierName]
            @pdbs = pdbs
            @emdb = identifierName
            myUrl = BaseUrl+"api/info/EMDB/data/"+@emdb
            jsonData = getUrl(myUrl)
            myData = JSON.parse(jsonData)
            if myData["contour"].nil?
              stThr = myData["limits"]["start"]
              endThr = myData["limits"]["end"]
              @threshold = (stThr + endThr)/2.0
            else
              @threshold = myData["contour"]
            end
            @stThr = myData["limits"]["start"]
            @endThr = myData["limits"]["end"]
            @step = (@endThr - @stThr)/100.0
            pdbs.each do |__pdb|
              pdb = __pdb.downcase
              options[pdb] = Hash.new
              url = BaseUrl+"api/mappings/PDB/Uniprot/"+pdb
              jsonData = getUrl(url)
              uniprotData = JSON.parse(jsonData)
              options[pdb] = uniprotData[pdb]
            end
            @optionsArray = []
            if options.empty?
              ali = Hash.new
              ali["origin"] = "EMDB"
              ali["emdb"] = identifierName
              @optionsArray.push(["No fitted PDB - Displaying EMDB map",ali.to_json])
              @changeSelector = true
              @noAlignments = true
            else
              arrayUniprotLengths=[]
              options.each do |pdb,uniprotData|
                if !uniprotData.nil? and !uniprotData.empty?
                  arrayUniprotLengths+=uniprotData.keys
                end
              end
              arrayUniprotLengths.uniq!
              if arrayUniprotLengths.length > 0
                url = BaseUrl+"api/lengths/UniprotMulti/"+arrayUniprotLengths.join(",")
                jsonData = getUrl(url)
                uniLengths = JSON.parse(jsonData)
              end
              options.each do |pdb,uniprotData|
                if uniprotData.nil? or uniprotData.empty?
                  #return render text: pdbs
                  ali = Hash.new
                  ali["pdbList"] = pdbs
                  ali["origin"] = "EMDB"
                  ali["pdb"] = pdb
                  ali["emdb"] = identifierName
                  @optionsArray.push(["PDB:#{pdb.upcase}, No alignments available with Uniprot",ali.to_json])
                  @noAlignments = true
                else
                  uniprotData.each do |uniprot,chains|
                    chains.each do |chain|
                      ali = Hash.new
                      ali["pdbList"] = pdbs
                      ali["origin"] = "EMDB"
                      ali["pdb"] = pdb
                      ali["chain"] = chain
                      ali["uniprot"] = uniprot
                      ali["uniprotLength"] = uniLengths[uniprot][0]
                      ali["uniprotTitle"] = uniLengths[uniprot][1]
                      ali["organism"] = uniLengths[uniprot][3]
                      ali["gene_symbol"] = uniLengths[uniprot][2]
                      ali["emdb"] = identifierName
                      @optionsArray.push(["PDB:#{pdb.upcase} CH:#{chain} Uniprot:#{uniprot} #{ali["uniprotTitle"]}",ali.to_json])
                    end
                  end
                end
              end
            end
          end
        end
      elsif identifierType=="PDB"
        if identifierName =~ /^\d{1}\w{3}$/ and identifierName !~ /^\d{4}$/
          url = BaseUrl+"api/info/PDB/available/"+identifierName
          jsonData = getUrl(url)
          availJson  = JSON.parse(jsonData)
          if availJson["available"]
            @isAvailable = true
          end
          url = BaseUrl+"api/info/PDB/title/"+identifierName
          jsonData = getUrl(url)
          titleJson = JSON.parse(jsonData)
          @moleculeTitle = titleJson["title"]
          @badName = false
          options = Hash.new
          url = BaseUrl+"api/mappings/PDB/Uniprot/"+identifierName
          jsonData = getUrl(url)
          uniprotData = JSON.parse(jsonData)
          if uniprotData.has_key?(identifierName)
            @notExists = false 
            options = uniprotData[identifierName]
            @optionsArray = []
            @pdbs = [identifierName]
            if options.empty?
              ali = Hash.new
              ali["origin"] = "PDB"
              ali["pdb"] = identifierName
              ali["pdbList"] = [identifierName]
              @optionsArray.push(["No alignments available - Display PDB information",ali.to_json])
              @changeSelector = true
            else
              url = BaseUrl+"api/lengths/UniprotMulti/"+options.keys.uniq.join(",")
              jsonData = getUrl(url)
              uniLengths = JSON.parse(jsonData)
              options.each do |uniprot,chains|
                chains.each do |chain|
                  ali = Hash.new
                  ali["origin"] = "PDB"
                  ali["pdb"] = identifierName
                  ali["pdbList"] = [identifierName]
                  ali["chain"] = chain
                  ali["uniprot"] = uniprot
                  ali["uniprotLength"] = uniLengths[uniprot][0]
                  ali["uniprotTitle"] = uniLengths[uniprot][1]
                  ali["organism"] = uniLengths[uniprot][3]
                  ali["gene_symbol"] = uniLengths[uniprot][2]
                  @optionsArray.push(["CH:#{chain} Uniprot:#{uniprot} #{ali["uniprotTitle"]}",ali.to_json])
                end
              end
            end
          end
        end
      elsif identifierType=="Uniprot"
        if identifierName =~ /^[OPQ][0-9][A-Z0-9]{3}[0-9]$|^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/
          #url = BaseUrl+"api/info/UniprotTitle/"+identifierName
          #jsonData = getUrl(url)
          #titleJson = JSON.parse(jsonData)
          #if titleJson["title"] != "Compound title not found"
          #  @isAvailable = true
          #end
          @badName = false
          options = Hash.new
          url = BaseUrl+"api/mappings/Uniprot/PDB/"+identifierName
          jsonData = getUrl(url)
          mappingData = JSON.parse(jsonData)
          url = BaseUrl+"/api/lengths/UniprotMulti/"+identifierName
          jsonData = getUrl(url)
          uniLength = JSON.parse(jsonData)
          @moleculeTitle = uniLength[identifierName][1]
          if @moleculeTitle != "Compound title not found"
            @isAvailable = true
          end
          if mappingData.has_key?(identifierName)
            @notExists = false 
            options = mappingData[identifierName]
            @optionsArray = []
            @pdbs = []
            if options.empty? 
              ali = Hash.new
              ali["origin"] = "Uniprot"
              ali["uniprot"] = identifierName
              ali["uniprotLength"] = uniLength[identifierName][0]
              ali["uniprotTitle"] = uniLength[identifierName][1]
              ali["organism"] = uniLength[identifierName][3]
              ali["gene_symbol"] = uniLength[identifierName][2]
              @optionsArray.push(["No atructural data is available, displaying Uniprot annotations",ali.to_json])
              @changeSelector = true
            else
              options.each do |pdb,info|
                resolution = info["resolution"].nil? ? "NA" : info["resolution"].to_s+"Å"
                ali = Hash.new
                ali["origin"] = "Uniprot"
                ali["pdb"] = pdb
                ali["pdbList"] = [pdb]
                ali["chain"] = info["chain"]
                ali["uniprot"] = identifierName
                ali["uniprotLength"] = uniLength[identifierName][0]
                ali["uniprotTitle"] = uniLength[identifierName][1]
                ali["organism"] = uniLength[identifierName][3]
                ali["gene_symbol"] = uniLength[identifierName][2]
                @optionsArray.push(["PDB:#{pdb.upcase} CH:#{info["chain"]} Mapping:#{info["start"]}-#{info["end"]} Resolution:#{resolution}",ali.to_json])
              end
            end
          end
        end
      end
      #return render text: @optionsArray.to_json
    end
  end #home

  def upload
    rand_path = (0...20).map { ('a'..'z').to_a[rand(26)] }.join.upcase
    if params[:structure_file].original_filename.include? "cif"
      file_name = "structure_file.cif"#params[:structure_file].original_filename
    else
      file_name = "structure_file.pdb"
    end
    @title = "File "+params[:structure_file].original_filename
    if params[:title] && params[:title].length>0
      @title = params[:title]
    end
    DataFile.save(params[:structure_file],file_name,rand_path)
    @rand  = rand_path
    @file = file_name 
    @structure_file = '/home/joan/apps/bionotes/public/upload/'+rand_path+'/'+file_name
    @http_structure_file = 'http://3dbionotes.cnb.csic.es/upload/'+rand_path+'/'+file_name
    @mapping  =  JSON.parse(`structure_to_fasta_json #{@structure_file}`)
    @error = nil
    if @mapping.has_key? "error"
      @error = @mapping["error"]
    else 
      @sequences = @mapping['sequences']
      @choice = {}
      do_not_repeat = {}
      @sequences.each do |ch,seq|
        if  do_not_repeat.key?(seq)
          @choice[ch] = do_not_repeat[seq]
        else
          #sprot
          blast = `ssh jsegura@campins 'echo #{seq} | sudo nice -n -10 ~/app/BLAST/ncbi-blast-2.5.0+/bin/blastp -num_threads 32 -task blastp-fast -query - -db ~/databases/UNIPROT/blast/sprot/sprot -outfmt "7 sacc stitle evalue pident qstart qend" -max_target_seqs 20 -qcov_hsp_perc 80 | grep -v "#"'`
          sprot, flag = parse_blast(blast,'sprot')
          if sprot.length > 0
            @choice[ch] = ( sprot.sort_by{ |k| -k['cov'].to_f } )
          end
          #trembl
          if !flag
            blast = `ssh jsegura@campins 'echo #{seq} | sudo nice -n -10 ~/app/BLAST/ncbi-blast-2.5.0+/bin/blastp -num_threads 32 -task blastp-fast -query - -db ~/databases/UNIPROT/blast/trembl/trembl -outfmt "7 sacc stitle evalue pident sstart send" -max_target_seqs 20 -qcov_hsp_perc 80 | grep -v "#"'`
            trembl, null = parse_blast(blast,'trembl')
            if trembl.length > 0
              if @choice[ch].nil?
                @choice[ch] = []
              end
              @choice[ch] = ( (@choice[ch]+trembl).sort_by{ |k| -k['cov'].to_f } ).first(20)
            end
          end
          #store_result
          if @choice[ch]!=nil && @choice[ch].length>0
            do_not_repeat[seq] = @choice[ch]
          end
        end
      end
      @viewerType = params[:viewer_type]
    end
  end

  def chain_mapping
    if params[:recover]
      recover_data = recover(params[:rand])
      @title=recover_data['title']
      @viewerType=recover_data['viewerType']
      @optionsArray=recover_data['optionsArray']
      @alignment=recover_data['alignment']
      @changeSelector=recover_data['changeSelector']
      @identifierType=recover_data['identifierType']
      @emdb=recover_data['emdb']
      @pdbs=recover_data['pdbs']
      @interface=recover_data['interface']
      @asa=recover_data['asa']
      @n_models=recover_data['n_models']
      @noAlignments = false
    else
      rand = params[:rand]
      file = params[:file]
      @title = params[:title]
      mapping = JSON.parse( params[:mapping] )
      @viewerType = params[:viewer_type]
      uniprot = {}
      do_not_repeat = {}
      alignment = {}
      alignment[file] = {}
      @optionsArray = []
      @noAlignments = true
      mapping['sequences'].each do |ch,seq|
        if ch==nil or seq==nil or params[ch] == nil
          next
        end
        @noAlignments = false
        acc,db,title,organism,gene_symbol =  params[ch].split('__')
        if do_not_repeat.key?(acc)
          uniprot[ch] = do_not_repeat[acc]
        else
          uniprot[ch] = `ssh jsegura@campins 'sudo nice -n -10 ~/apps/BLAST/ncbi-blast-2.5.0+/bin/blastdbcmd -db ~/databases/UNIPROT/blast/#{db}/#{db} -entry #{acc} -line_length 1000000 -outfmt %s'`
          uniprot[ch] = uniprot[ch].chomp
          do_not_repeat[acc] = uniprot[ch]
        end
        alignment[file][ch]={}
        alignment[file][ch][acc] = align_sequences(uniprot[ch],seq,mapping['mapping'][ch],rand)
        @optionsArray.push(["CH:#{ch} Uniprot:#{acc} #{title}",{'pdb'=>file,'chain'=>ch,'uniprot'=>acc, 'uniprotLength'=>uniprot[ch].length, 'uniprotTitle'=>title, 'organism'=>organism, 'gene_symbol'=>gene_symbol,  'path'=>rand}.to_json])
      end
      File.write(LocalPath+"/"+rand+"/alignment.json", alignment.to_json)
      @alignment = alignment
      @changeSelector = true
      @identifierType = 'local'
      @emdb = ""
      @pdbs = [rand,file]
      #@interface  = JSON.parse( `structure_interface_json #{file} #{rand}` )   
      computed_data  = JSON.parse( `structure_interface_json #{file} #{rand}` )
      @interface = computed_data['interface']
      @asa = computed_data['asa']
      @n_models = mapping['n_models']

      save_data( {'title'=>@title,
                  'viewerType'=>@viewerType, 
                  'optionsArray'=>@optionsArray, 
                  'alignment'=>@alignment, 
                  'changeSelector'=>@changeSelector, 
                  'identifierType'=>@identifierType,  
                  'emdb'=>@emdb, 
                  'pdbs'=>@pdbs, 
                  'interface'=>@interface,
                  'asa'=>@asa,
                  'n_models'=>@n_models
                 }, rand)
    end
  end

  def recover(rand)
    recover_data = JSON.parse( File.read(LocalPath+"/"+rand+"/recover_data.json") )
    return recover_data

  end

  def save_data(json_data,rand)
    File.write(LocalPath+"/"+rand+"/recover_data.json", json_data.to_json)
  end
  def parse_blast(blast,db)
    out = []
    rows = blast.split("\n")
    flag = false
    rows.each do |r|
      c = r.split("\t")
      title = parse_title(c[1])
      out.push({ 'acc'=>c[0], 'title'=>title, 'evalue'=>c[2], 'cov'=>c[3], 'start'=>c[4], 'end'=>c[5], 'db'=>db })
      if c[3].to_f  > 80 && !flag
        flag  = true
      end
    end
    return out, flag
  end

  def parse_title(title)
    tmp = title.split("=")
    out = {}
    long_name = tmp[0].chop.chop.chop
    short_name = long_name
    if long_name.length > 15
      short_name = long_name[0..11]+" ..."
    end
    out['name'] = {'short'=>short_name,'long'=>long_name}
    if tmp[0].include? " OS"
      long_org = tmp[1].chop.chop.chop
      short_org = long_org
      if short_org.length > 15
        short_org = long_org[0..11]+" ..."
      end
      out['org'] = {'short'=>short_org, 'long'=>long_org} 
    else
      out['org'] = "UNK"
    end
    if tmp[1].include? " GN"
      out['gene'] = tmp[2].chop.chop.chop
    else
      out['gene'] = "UNK"
    end
    return out
  end

  def align_sequences(uniprot_seq, ch_seq, mapping,rand)
    File.write(LocalPath+"/"+rand+"/can_seq", uniprot_seq)
    File.write(LocalPath+"/"+rand+"/trans_seq", ch_seq)
  
    cmd = "echo \"\n\" | water -asequence "+LocalPath+"/"+rand+"/can_seq -bsequence "+LocalPath+"/"+rand+"/trans_seq -gapopen 50 -gapextend 0 -datafile /home/joan/tools/ENSEMBL/IDENTITY -aformat3 markx10 -stdout -aglobal3 Y -awidth3 1000000 2> /dev/null" 

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
    out = { 'mapping'=>[], 'inverse'=>{}, 'uniprotSeq'=>uniprot_seq, 'pdbSeq'=>pdb_seq }
    (0..(uniprot_seq.length-1)).each do |i|
      if can2trans[i+1]>0
        out['mapping'].push({'pdbIndex':mapping[ can2trans[i+1]-1 ]})
        out['inverse'][ mapping[ can2trans[i+1]-1 ] ] = i+1
      else
        out['mapping'].push({})
      end
    end
    system("rm "+LocalPath+"/"+rand+"/can_seq")
    system("rm "+LocalPath+"/"+rand+"/trans_seq")
    return out
  end

end
