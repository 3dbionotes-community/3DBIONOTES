class MainController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"
  
  helper_method :getAlignments
  helper_method :getUrl

  def getUrl(url)
    begin
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
    else
      @viewerType = "jsmol"
    end
    identifierName = params[:queryId]
    if identifierName != nil
      if identifierName.upcase =~ /^EMD-\d+$/
        identifierName.upcase!
        identifierType = "EMDB"
      elsif identifierName.downcase =~ /^\d{1}\w{3}$/
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
    if !identifierType.nil? and !identifierName.nil?
      identifierName.strip!
      @changeSelector = false
      @badName = true
      @notExists = true
      @emdb = ""
      if identifierType=="EMDB"
        #chequear si el EMDB es valido
        if identifierName =~ /^EMD-\d+$/
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
            pdbs.each do |pdb|
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
              @optionsArray.push(["No alignments available - Display EMDB information",ali.to_json])
              @changeSelector = true
            else
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
                      url = BaseUrl+"api/lengths/Uniprot/"+uniprot
                      uniLength = getUrl(url)
                      ali = Hash.new
                      ali["pdbList"] = pdbs
                      ali["origin"] = "EMDB"
                      ali["pdb"] = pdb
                      ali["chain"] = chain
                      ali["uniprot"] = uniprot
                      ali["uniprotLength"] = uniLength
                      ali["emdb"] = identifierName
                      @optionsArray.push(["PDB:#{pdb.upcase} Chain:#{chain} Uniprot:#{uniprot}",ali.to_json])
                    end
                  end
                end
              end
            end
          end
        end
      elsif identifierType=="PDB"
        if identifierName =~ /^\d{1}\w{3}$/
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
              options.each do |uniprot,chains|
                chains.each do |chain|
                  url = BaseUrl+"api/lengths/Uniprot/"+uniprot
                  uniLength = getUrl(url)
                  ali = Hash.new
                  ali["origin"] = "PDB"
                  ali["pdb"] = identifierName
                  ali["pdbList"] = [identifierName]
                  ali["chain"] = chain
                  ali["uniprot"] = uniprot
                  ali["uniprotLength"] = uniLength
                  @optionsArray.push(["Chain:#{chain} Uniprot:#{uniprot}",ali.to_json])
                end
              end
            end
          end
        end
      elsif identifierType=="Uniprot"
        if identifierName =~ /^[OPQ][0-9][A-Z0-9]{3}[0-9]$|^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/
          @badName = false
          options = Hash.new
          url = BaseUrl+"api/mappings/Uniprot/PDB/"+identifierName
          jsonData = getUrl(url)
          mappingData = JSON.parse(jsonData)
          if mappingData.has_key?(identifierName)
            @notExists = false 
            options = mappingData[identifierName]
            @optionsArray = []
            @pdbs = []
            if options.empty? 
              url = BaseUrl+"api/lengths/Uniprot/"+identifierName
              uniLength = getUrl(url)
              ali = Hash.new
              ali["origin"] = "Uniprot"
              ali["uniprot"] = identifierName
              ali["uniprotLength"] = uniLength
              @optionsArray.push(["No alignments available - Display Uniprot information",ali.to_json])
              @changeSelector = true
            else
              options.each do |pdb,info|
                resolution = info["resolution"].nil? ? "NA" : info["resolution"].to_s+"Å"
                url = BaseUrl+"api/lengths/Uniprot/"+identifierName
                uniLength = getUrl(url)
                ali = Hash.new
                ali["origin"] = "Uniprot"
                ali["pdb"] = pdb
                ali["pdbList"] = [pdb]
                ali["chain"] = info["chain"]
                ali["uniprot"] = identifierName
                ali["uniprotLength"] = uniLength
                @optionsArray.push(["PDB:#{pdb.upcase} Chain:#{info["chain"]} Mapping:#{info["start"]}-#{info["end"]} Resolution:#{resolution}",ali.to_json])
              end
            end
          end
        end
      end
      #return render text: @optionsArray.to_json
    end
  end
end
