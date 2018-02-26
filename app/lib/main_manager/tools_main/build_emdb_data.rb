module MainManager
  module ToolsMain
    module BuildEmdbData

      include MainManager::SourceMain::MainSites  
      include GlobalTools::FetchParserTools

      def _fetch_emdb_data(identifierName)
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
                    @optionsArray.push(["#{chain} - #{ali["gene_symbol"]}, #{ali["uniprotTitle"]}",ali.to_json])
                  end
                end
              end
            end
          end
        end
      end

    end
  end
end
