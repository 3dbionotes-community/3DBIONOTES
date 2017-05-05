class InfoController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"
  Server = "https://www.ebi.ac.uk/pdbe/api/"
  UniprotURL = "http://www.uniprot.org/uniprot/"
  EmdbMap = "emdb/entry/map/"
  EmdbSummary = "emdb/entry/summary/"
  PdbSummary = "pdb/entry/summary/"
  helper_method :makeRequest
  helper_method :getUrl

  # Si input es un String, se hace un GET
  # Si input es Array de Strings, se hace un POST
  def getUrl(url)
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
    return data
  end  

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

  def getEMDBsize
    emdbId = params[:name].upcase
    if emdbId =~ /^EMD-\d+$/
      request = makeRequest(Server+EmdbMap,emdbId)
    else
      request = nil
    end
    if request.nil?
      request = "{}"
    end
    json = JSON.parse(request)
    tmp = {}
    json.each do |k,v|
      if !v[0].empty?
        if !v[0]["map"].nil?
          if !v[0]["map"]["dimensions"].nil?
            tmp["dimensions"] = v[0]["map"]["dimensions"]
          end
          if !v[0]["map"]["pixel_spacing"].nil?
            tmp["spacing"] = v[0]["map"]["pixel_spacing"]
          end
        end
      end
    end
    maxSize = ""
    myStatus = :not_found
    if !tmp["dimensions"].nil? and !tmp["spacing"].nil?
      col = tmp["dimensions"]["column"].to_f * tmp["spacing"]["y"]["value"].to_f
      sect = tmp["dimensions"]["section"].to_f * tmp["spacing"]["x"]["value"].to_f
      row = tmp["dimensions"]["row"].to_f * tmp["spacing"]["z"]["value"].to_f
      arr = [col,sect,row]
      maxSize = arr.max.to_s
      myStatus = :ok
    end
    return render json: maxSize, status: myStatus
  end

  def getEMDBtitle
    emdbId = params[:name].upcase
    if emdbId =~ /^EMD-\d{4}$/
      request = makeRequest(Server+EmdbSummary,emdbId)
    else
      request = nil
    end
    if request.nil?
      request = "{}"
    end
    json = JSON.parse(request)
    title = "Compound title not found"
    json.each do |k,v|
      if !v[0].empty?
        if !v[0]["deposition"].nil?
          title = v[0]["deposition"]["title"].upcase
        end
      end
    end
    myStatus = :ok
    return render json: {"title"=>title}, status: myStatus
  end

  def getEMDBinfo
    emdbId = params[:name].upcase
    if emdbId =~ /^EMD-\d+$/
      request = makeRequest(Server+EmdbMap,emdbId)
    else
      request = nil
    end
 
    if request.nil?
      request = "{}"
    end
    json = JSON.parse(request)
    emdbInfo = {}
    json.each do |k,v|
      if !v[0].empty?
        if !v[0]["map"].nil?
          if !v[0]["map"]["contour_level"].nil?
            emdbInfo["contour"]=v[0]["map"]["contour_level"]["value"]
          end
          if !v[0]["map"]["statistics"].nil?
            emdbInfo["limits"] = {}
            emdbInfo["limits"]["start"] = v[0]["map"]["statistics"]["minimum"]
            emdbInfo["limits"]["end"] = v[0]["map"]["statistics"]["maximum"]
          end
        end
      end
    end
    myStatus = :ok
    if emdbInfo == {}
      myStatus = :not_found
    end
    return render json: emdbInfo, status: myStatus
  end

  def isPDBavailable
    require "net/http"

    pdb = params[:name].upcase
    pdbInfo = {}
    if pdb =~ /^\d{1}\w{3}$/ and pdb !~ /^\d{4}$/
      require "net/http"
      url = URI.parse("http://www.ebi.ac.uk/pdbe/entry-files/download/"+params[:name].downcase+".cif")
      begin
        req = Net::HTTP.new(url.host, url.port)
        res = req.request_head(url.path)
      rescue
        pdbInfo = {"id"=>pdb,"available"=>false, "error"=>"HTTP ERROR"}
        myStatus = :not_found
        return render json: pdbInfo, status: myStatus
      end
      if res.code == "200"
        pdbInfo = {"id"=>pdb,"available"=>true}
      else
        pdbInfo = {"id"=>pdb,"available"=>false}
      end
    else
      pdbInfo = {"id"=>pdb,"available"=>false, "error"=>"UNKNOWN PDB ID"}
    end
    myStatus = :ok
    if pdbInfo == {}
      myStatus = :not_found
    end


    return render json: pdbInfo, status: myStatus
  end

  def isEMDBavailable
    emdbId = params[:name].upcase
    emdbInfo = {}
    if emdbId =~ /^EMD-\d{4}$/
      emdb_code  = emdbId[4..emdbId.length]
      #emdb_url = "http://ftp.ebi.ac.uk/pub/databases/emdb/structures/"+emdbId+"/map/emd_"+emdb_code+".map.gz"
      emdb_url = "http://www.ebi.ac.uk/pdbe/static/files/em/maps/emd_"+emdb_code+".map.gz"
      url = URI.parse( emdb_url )
      begin 
        req = Net::HTTP.new(url.host, url.port)
        res = req.request_head(url.path)
      rescue
        emdbInfo = {"id"=>emdbId,"available"=>false, "error"=>"HTTP ERROR"}
        myStatus = :not_found
        return render json: emdbInfo, status: myStatus
      end
      if res.code == "200" 
        emdbInfo = {"id"=>emdbId,"available"=>true}
      else
        emdbInfo = {"id"=>emdbId,"available"=>false}
      end
    else
      emdbInfo = {"id"=>emdbId,"available"=>false, "error"=>"UNKNOWN EMDB ID"} 
    end
 
    url = BaseUrl+"api/mappings/EMDB/PDB/"+emdbId
    jsonData = getUrl(url)
    pdbData = JSON.parse(jsonData)
    pdbs = []
    if pdbData.has_key?(emdbId)
      pdbs = pdbData[emdbId]
    end

    if pdbs.length == 0
      emdbInfo["fitted_pdb"] = false
    else
      emdbInfo["fitted_pdb"] = true
    end
    pdbs.each do |__pdb|
      url = BaseUrl+"api/info/PDB/available/"+__pdb.downcase
      jsonData = getUrl(url)
      titlePDBJson = JSON.parse(jsonData)
      if titlePDBJson["available"] != true and emdbInfo["available"] == true
        emdbInfo["available"] = false
      end
    end
    myStatus = :ok
    if emdbInfo == {}
      myStatus = :not_found
    end
    headers['Access-Control-Allow-Origin'] = '*'
    return render json: emdbInfo, status: myStatus
  end

  def isEMDBavailable_jsonp
    emdbId = params[:name].upcase
    emdbInfo = {}
    if emdbId =~ /^EMD-\d{4}$/
      emdb_code  = emdbId[4..emdbId.length]
      #emdb_url = "http://ftp.ebi.ac.uk/pub/databases/emdb/structures/"+emdbId+"/map/emd_"+emdb_code+".map.gz"
      emdb_url = "http://www.ebi.ac.uk/pdbe/static/files/em/maps/emd_"+emdb_code+".map.gz"
      url = URI.parse( emdb_url )
      begin 
        req = Net::HTTP.new(url.host, url.port)
        res = req.request_head(url.path)
      rescue
        emdbInfo = {"id"=>emdbId,"available"=>false, "error"=>"HTTP ERROR"}
        myStatus = :not_found
        return render json: emdbInfo, status: myStatus
      end
      if res.code == "200" 
        emdbInfo = {"id"=>emdbId,"available"=>true}
      else
        emdbInfo = {"id"=>emdbId,"available"=>false}
      end
    else
      emdbInfo = {"id"=>emdbId,"available"=>false, "error"=>"UNKNOWN EMDB ID"} 
    end
 
    url = BaseUrl+"api/mappings/EMDB/PDB/"+emdbId
    jsonData = getUrl(url)
    pdbData = JSON.parse(jsonData)
    pdbs = []
    if pdbData.has_key?(emdbId)
      pdbs = pdbData[emdbId]
    end

    if pdbs.length == 0
      emdbInfo["fitted_pdb"] = false
    else
      emdbInfo["fitted_pdb"] = true
    end
    pdbs.each do |__pdb|
      url = BaseUrl+"api/info/PDB/available/"+__pdb.downcase
      jsonData = getUrl(url)
      titlePDBJson = JSON.parse(jsonData)
      if titlePDBJson["available"] != true and emdbInfo["available"] == true
        emdbInfo["available"] = false
      end
    end
    myStatus = :ok
    if emdbInfo == {}
      myStatus = :not_found
    end
    callback_name = "isEMDBavailable"
    if params.key?('callback') and ! params['callback'].nil? and params['callback'].length>0
      callback_name = params['callback']
    end
    jsonp = callback_name+'('+emdbInfo.to_json+')'
    return render text: jsonp, status: myStatus
  end


  def getUniprotSequence(uniprotAc)
    begin
      data = Net::HTTP.get_response(URI.parse(UniprotURL+uniprotAc+".fasta"))
    rescue
      puts "Error: #{$!}"
    end
    fasta = nil
    if data.code != "404"
      fasta = Bio::FastaFormat.new(data.body)
    end
    return fasta
  end

  def displayUniprotSequence
    uniprotAc = params[:name]
    returnValue = ""
    fasta = getUniprotSequence(uniprotAc)
    if !fasta.nil?
      returnValue = fasta.seq
    end
    return render json: returnValue, status: :ok
  end

  def getUniprotTitle
    uniprotAc = params[:name]
    begin
      data = Net::HTTP.get_response(URI.parse(UniprotURL+uniprotAc+".fasta"))
    rescue
      puts "Error: #{$!}"
    end
    title = "Compound title not found"
    if !data.nil? and data.code != "404"
      data = Bio::FastaFormat.new(data.body)
    else
      data = nil
    end
    if !data.nil? and data.definition.length>0
      title = data.definition.split(/\|/)[2].split(/\sOS=/)[0].split(/\s/,2)[1].upcase
    end
    return render json: {"title"=>title}, status: :ok
  end

  def getPDBtitle
    pdbId = params[:name].upcase
    request = makeRequest(Server+PdbSummary,pdbId)
    json = {}
    if request
      json = JSON.parse(request)
    end
    title = "Compound title not found"
    json.each do |k,v|
      if !v[0].empty?
        title = v[0]["title"].upcase
      end
    end
    myStatus = :ok
    return render json: {"title"=>title}, status: myStatus
  end

end
