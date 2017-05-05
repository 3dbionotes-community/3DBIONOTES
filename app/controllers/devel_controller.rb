class DevelController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"
  
  helper_method :getAlignments
  helper_method :getUrl

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

  def getAlignments(pdbList)
    alignList = {}
    pdbList.each do |pdb|
      url = BaseUrl+"api/alignments/PDB/"+pdb
      jsonData = getUrl(url)
      mappingData = JSON.parse(jsonData)
      alignList[pdb]=mappingData
    end
    return alignList
  end

  def home
    @title = "Home"
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
          availJson  = JSON.parse(jsonData)
          if availJson["available"]
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
                  @optionsArray.push(["CH:#{chain} Uniprot:#{uniprot} #{ali["uniprotTitle"]}",ali.to_json])
                end
              end
            end
          end
        end
      elsif identifierType=="Uniprot"
        if identifierName =~ /^[OPQ][0-9][A-Z0-9]{3}[0-9]$|^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/
          url = BaseUrl+"api/info/UniprotTitle/"+identifierName
          jsonData = getUrl(url)
          titleJson = JSON.parse(jsonData)
          @moleculeTitle = titleJson["title"]
          if titleJson["title"] != "Compound title not found"
            @isAvailable = true
          end
          @badName = false
          options = Hash.new
          url = BaseUrl+"api/mappings/Uniprot/PDB/"+identifierName
          jsonData = getUrl(url)
          mappingData = JSON.parse(jsonData)
          url = BaseUrl+"api/lengths/Uniprot/"+identifierName
          uniLength = getUrl(url)
          if mappingData.has_key?(identifierName)
            @notExists = false 
            options = mappingData[identifierName]
            @optionsArray = []
            @pdbs = []
            if options.empty? 
              ali = Hash.new
              ali["origin"] = "Uniprot"
              ali["uniprot"] = identifierName
              ali["uniprotLength"] = uniLength
              ali["uniprotTitle"] = @moleculeTitle
              @optionsArray.push(["No alignments available - Display Uniprot information",ali.to_json])
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
                ali["uniprotLength"] = uniLength
                ali["uniprotTitle"] = @moleculeTitle
                @optionsArray.push(["PDB:#{pdb.upcase} CH:#{info["chain"]} Mapping:#{info["start"]}-#{info["end"]} Resolution:#{resolution}",ali.to_json])
              end
            end
          end
        end
      end
      #return render text: @optionsArray.to_json
    end
  end
end
