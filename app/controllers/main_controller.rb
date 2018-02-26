class MainController < ApplicationController
  
  include GlobalTools::FetchParserTools
  include MainManager::MainTools
  include MainManager::ToolsMain::BuildAlignment
  include ProteinManager::BlastSearch
  include ProteinManager::FetchSequenceInfo

  LocalPath = Settings.GS_LocalUpload 
  LocalScripts = Settings.GS_LocalScripts
  BaseUrl = Settings.GS_BaseUrl
  PDB_REDO = Settings.GS_PDB_REDO

  def home
    if request.referer
      logger.info("  HTTP Referer: #{request.referer}") 
    end
    @log = ""
    @title = "Home"
    @noAlignments = false
    @isAvailable = true
    @viewerType = viewer_type( params[:viewer_type] )

    identifierName = params[:queryId]
    if !identifierName.nil?
      identifierName.strip!
    end
    identifierType = identify_type(identifierName)
    @identifierName = identifierName
    @identifierType = identifierType

    if identifierType.nil? and !identifierName.nil?
      @notExists = true
    end

    if !identifierType.nil? and !identifierName.nil?
      @changeSelector = false
      @badName = true
      @notExists = true
      @isAvailable = false
      @emdb = ""
      if identifierType=="EMDB"
        fetch_emdb_data(identifierName)
      elsif identifierType=="PDB"
        fetch_pdb_data(identifierName)
      elsif identifierType=="Uniprot"
        fetch_uniprot_data(identifierName)
      end
    end
  end 

  def pdb_redo
    pdb = params[:name]
    rand_path = "pdb_redo_"+pdb
    file_name = pdb+"_final.pdb"
    url = PDB_REDO+"/"+pdb+"/"+file_name
    file_content, http_code, http_code_name = getUrl(url,verbose=true)
    if http_code.to_i > 399
      return render json: {"error"=>"URL "+url+" was not reachable", "http_error"=>http_code_name}, status: :ok
    elsif http_code.to_i == 0
      return render json: {"error"=>"ruby exception", "url"=> url, "exception"=>file_content}, status: :ok
    else
      DataFile.save_string(file_content, file_name, rand_path)
    end

    @title = "PDB_REDO entry "+pdb.upcase
    @rand  = rand_path
    @file = file_name 
    @structure_file = LocalPath+'/'+rand_path+'/'+file_name
    @http_structure_file = BaseUrl+'/upload/'+rand_path+'/'+file_name

    @mapping  =  JSON.parse(`#{LocalScripts}/structure_to_fasta_json #{@structure_file}`)

    @error = nil
    if @mapping.has_key? "error"
      @error = @mapping["error"]
    else 
      @sequences = @mapping['sequences']
      @choice = {}
      do_not_repeat = {}
      aCC = {}
      pdbData = JSON.parse( PdbDatum.find_by(pdbId: pdb).data )
      @sequences.each do |ch,seq|
        acc = pdbData[ch].keys[0]
        aCC[acc] = true
      end
      aCC = fetchUniprotMultipleSequences(aCC.keys.join(","),fasta_obj_flag=nil,dict_flag=true)
      puts(aCC)
      @sequences.each do |ch,seq|
        acc = pdbData[ch].keys[0]
        @choice[ch] = acc+"__sprot__"+aCC[acc]["definition"]+"__"+aCC[acc]["organism"]+"__"+aCC[acc]["gene_symbol"]
      end
      @viewerType = "ngl"
    end
  end

  def upload
    rand_path = (0...20).map { ('a'..'z').to_a[rand(26)] }.join.upcase
    if params[:structure_file].original_filename.include? "cif"
      file_name = "structure_file.cif"
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
    @structure_file = LocalPath+'/'+rand_path+'/'+file_name
    @http_structure_file = BaseUrl+'/upload/'+rand_path+'/'+file_name
    @mapping  =  JSON.parse(`#{LocalScripts}/structure_to_fasta_json #{@structure_file}`)
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
          blast_results = runBlast(seq)
          @choice[ch] = ( blast_results.sort_by{ |k| -k['cov'].to_f } )
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
      rand = params[:rand]
      recover_data = recover(rand)
      @title=recover_data['title']
      @viewerType=recover_data['viewerType']
      @optionsArray=recover_data['optionsArray']
      @alignment=recover_data['alignment']
      @changeSelector=recover_data['changeSelector']
      @identifierType=recover_data['identifierType']
      @emdb=recover_data['emdb']
      @pdbs=recover_data['pdbs']
      @n_models=recover_data['n_models']
      @no_aa_ch=recover_data['no_aa_ch']
      @file=recover_data['file']
      @noAlignments = false
    else
      rand = params[:rand]
      file = params[:file]
      @file = file
      @title = params[:title]
      mapping = JSON.parse( params[:mapping] )
      @viewerType = params[:viewer_type]
      uniprot = {}
      do_not_repeat = {}
      alignment = {}
      alignment[file] = {}
      @optionsArray = []
      @noAlignments = true
      @no_aa_ch = mapping['no_aa_ch']
      mapping['sequences'].each do |ch,seq|
        if ch==nil or seq==nil or params[ch] == nil
          next
        end
        @noAlignments = false
        acc,db,title,organism,gene_symbol =  params[ch].split('__')
        if do_not_repeat.key?(acc)
          uniprot[ch] = do_not_repeat[acc]
        else
          _seq = fetchUniprotSequence(acc)
          uniprot[ch] = _seq.seq
          uniprot[ch] = uniprot[ch].chomp
          do_not_repeat[acc] = uniprot[ch]
        end
        alignment[file][ch]={}
        alignment[file][ch][acc] = align_sequences_mc(uniprot[ch],seq,mapping['mapping'][ch],rand)
        @optionsArray.push(["#{ch} - #{gene_symbol}, #{title}",{'pdb'=>file,'chain'=>ch,'uniprot'=>acc, 'uniprotLength'=>uniprot[ch].length, 'uniprotTitle'=>title, 'organism'=>organism, 'gene_symbol'=>gene_symbol,  'path'=>rand}.to_json])
      end
      File.write(LocalPath+"/"+rand+"/alignment.json", alignment.to_json)
      @alignment = alignment
      @changeSelector = true
      @identifierType = 'local'
      @emdb = ""
      @pdbs = [rand,file]
      @n_models = mapping['n_models']

      save_data( {'title'=>@title,
                  'viewerType'=>@viewerType, 
                  'optionsArray'=>@optionsArray, 
                  'alignment'=>@alignment, 
                  'changeSelector'=>@changeSelector, 
                  'identifierType'=>@identifierType,  
                  'emdb'=>@emdb, 
                  'pdbs'=>@pdbs, 
                  'n_models'=>@n_models,
                  'no_aa_ch'=>@no_aa_ch,
                  'file'=>@file
                 }, rand)
    end
    if File.exists?( LocalPath+'/'+rand+'/external_annotations.json' ) then
      @external_annotations = JSON.parse( File.read(LocalPath+"/"+rand+"/external_annotations.json").sub(/\n/,"") ).to_json
    else
      @external_annotations = nil
    end
  end

  def recover(rand)
    recover_data = JSON.parse( File.read(LocalPath+"/"+rand+"/recover_data.json") )
    return recover_data

  end

  def save_data(json_data,rand)
    File.write(LocalPath+"/"+rand+"/recover_data.json", json_data.to_json)
  end

end
