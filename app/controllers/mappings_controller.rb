class MappingsController < ApplicationController
  
  Server = "https://www.ebi.ac.uk/pdbe/api/"
  EmdbFit = "emdb/entry/fitted/"
  SIFTSPDB = "mappings/best_structures/"
  SIFTSUniprot = "mappings/uniprot/"
  UniprotURL = "http://www.uniprot.org/uniprot/"


  helper_method :makeRequest
  helper_method :getPDBsFromEMDB
  helper_method :getUniprotExistence
  helper_method :getPDBExistence
  helper_method :ensembl_transcript
  helper_method :uniprot_mapping


  def getUniprotExistence(uniprotAc)
    begin
      code = Net::HTTP.get_response(URI.parse(UniprotURL+uniprotAc+".fasta")).code
    rescue
      puts "Error: #{$!}"
    end
    exists = false
    if code=="200"
      exists = true
    end
    return exists
  end

  def getPDBExistence(pdb)
    begin
      code = Net::HTTP.get_response(URI.parse("http://www.rcsb.org/pdb/files/"+pdb.upcase+".pdb?headerOnly=YES")).code
    rescue
      puts "Error: #{$!}"
    end
    exists = false
    if code=="200"
      exists = true
    end
    return exists
  end
 
  # Si input es un String, se hace un GET
  # Si input es Array de Strings, se hace un POST
  def makeRequest(url,input)
    #GET
    if input.class == String
      begin
        rawData = Net::HTTP.get_response(URI.parse(url+input))
        if rawData.code == "404"
          data = nil
        else
          data = rawData.body
        end
      rescue
        puts "Error: #{$!}"
      end
    #POST
    else
      uri = URI.parse(url+"/")
      begin
        data = Net::HTTP.new(uri.host).post(uri.path,input.join(",")).body
      rescue
        puts "Error: #{$!}"
      end
    end
    return data
  end  
  
  # from a String containing an emdbId
  # this method returns the PDBs associated to each of those
  def getPDBsFromEMDB
    emdbId = params[:name].upcase
    emdbToPDB = Hash.new
    if emdbId =~ /^EMD-\d+$/
      request = makeRequest(Server+EmdbFit,emdbId)
    else
      request = nil
    end
    if request.nil?
      request = "{}"
    end
    json = JSON.parse(request)
    json.each do |k,v|
      tmpArray = []
      v.each do |fit|
        if fit != {}
          tmpArray+=fit["fitted_emdb_id_list"]["pdb_id"]
        end
      end
      emdbToPDB[k]=tmpArray
    end
    myStatus = :ok
    if emdbToPDB == {}
      myStatus = :not_found
    end
    return render json: emdbToPDB, status: myStatus
  end
  
  def getPDBFromUniprot
    uniprotAc = params[:name].upcase
    pdbFromUniprot = Hash.new
    if uniprotAc =~ /^[OPQ][0-9][A-Z0-9]{3}[0-9]$|^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/
      request = makeRequest(Server+SIFTSPDB,uniprotAc)
    else
      request = nil
    end
    if request.nil?
      request = "{}"
    end
    json = JSON.parse(request)
    json.each do |k,v|
      pdbFromUniprot[k] = {}
      v.each do |el|
        pdbFromUniprot[k][el["pdb_id"]]={"start"=>el["unp_start"],"end"=>el["unp_end"],"chain"=>el["chain_id"],"resolution"=>el["resolution"]}
      end
    end
    myStatus = :ok
    if pdbFromUniprot == {}
      if getUniprotExistence(uniprotAc)
        pdbFromUniprot={uniprotAc=>{}}
      end
      myStatus = :not_found
    end
    return render json: pdbFromUniprot, status: myStatus
  end
  
  def getUniprotFromPDB
    pdbId = params[:name]
    uniprotFromPDB = Hash.new
    if pdbId =~ /^\d{1}\w{3}$/
      request = makeRequest(Server+SIFTSUniprot,pdbId)
    else
      request = {}
    end
    if request.nil?
      request = "{}"
    end
    json = JSON.parse(request)
    # para cada identificador de pdbe
    json.each do |k,v|
      uniprotFromPDB[k] = Hash.new
      # para cada identificador uniprot
      v["UniProt"].each do |ki,vi|
        if uniprotFromPDB[k][ki].nil?
          uniprotFromPDB[k][ki] = Array.new
        end
        # para cada mapping
        vi["mappings"].each do |mapping|
          uniprotFromPDB[k][ki].push(mapping["chain_id"])
        end
      end
    end
    myStatus = :ok
    if uniprotFromPDB == {}
      if getPDBExistence(pdbId)
        uniprotFromPDB = {pdbId=>[]}
      end
      myStatus = :not_found
    end
    return render json: uniprotFromPDB, status: myStatus
  end

  #ENSEMBL MAPPINGS
  def getENSEMBLtranscriptFromUniprot
    acc = params[:name].upcase
    __out = uniprot_mapping(acc,'ENSEMBL_ID')
    if __out.length == 0
      myStatus = :ok
      return render json: {'gene'=>nil,'transcript'=>nil}, status: myStatus
    end 
    ens_g = ''
    v = 0
    __out.each do |g|
      info = JSON.parse( makeRequest('http://rest.ensembl.org','/lookup/id/'+g+'?content-type=application/json') )
      if Integer(info['version'])>v
        v = Integer(info['version'])
        ens_g = info 
      end
    end
    __out_1 = uniprot_mapping(acc,'ENSEMBL_TRS_ID')
    __out_2 = ensembl_transcript(ens_g['id'])
    __out = []
    ( __out_2.keys & __out_1 ).each do |o|
    #( __out_2.keys )..each do |o|
      __out.push( {'id'=>o,'name'=>__out_2[o]} )
    end
    myStatus = :ok
    return render json: {'gene'=>ens_g,'transcript'=>__out}, status: myStatus
  end
  def ensembl_transcript(id)
    path = '/lookup/id/'+id+'?expand=1&content-type=application/json'
    __out = JSON.parse( makeRequest('http://rest.ensembl.org',path) )
    out = {}
    __out['Transcript'].each do |o|
      if o['object_type'] == 'Transcript'
        out[ o['id'] ] =  o['display_name'] 
      end
    end
    return out
  end

  def uniprot_mapping_ws(acc,id_type='ENSEMBL_ID')
    base = 'www.uniprot.org'
    tool = 'mapping'
    params = {
      'from' => 'ACC', 'to' => id_type, 'format' => 'tab',
      'query' => acc
    }
    if request.port==3000
      puts "\n======================================\n"
      puts 'http://' + base + '/' + tool + '/?' + params.keys.map {|key| key + '=' + params[key]}.join('&')
      puts "\n======================================\n"
    end
    http = Net::HTTP.new base
    response = http.request_post '/' + tool + '/', params.keys.map {|key| key + '=' + params[key]}.join('&')
    if request.port==3000
      puts "\nDONE!!!!\n"
    end
    loc = nil
    while response.code == '302'
      loc = response['Location']
      response = http.request_get loc
    end
    
    while loc
      wait = response['Retry-After'] or break
      sleep wait.to_i
      response = http.request_get loc
    end
    
    response.value # raises http error if not 2xx
    __out = response.body.split("\n")
    __out.shift
    out = []
    __out.each do |g|
      i = g.split("\t")
      out.push( i[1] )
    end
    return out
  end   

  def uniprot_mapping(acc,id_type='ENSEMBL_ID')
    info = Uniprotmappingentry.find_by(proteinId: acc)
    if info.nil?
      return []
    end
    out = []
    if id_type == 'ENSEMBL_ID'
      out = JSON.parse(info['gene'])
    end

    if id_type == 'ENSEMBL_TRS_ID'
      out = JSON.parse(info['transcript'])
    end

    return out
  end
end
