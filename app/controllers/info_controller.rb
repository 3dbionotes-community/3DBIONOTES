class InfoController < ApplicationController

  Server = "https://www.ebi.ac.uk/pdbe/api/"
  EmdbMap = "emdb/entry/map/"
  UniprotURL = "http://www.uniprot.org/uniprot/"
  helper_method :makeRequest

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

end
