module MainManager
  module ToolsMain
    module BuildPdbData

      include MainManager::SourceMain::MainSites  
      include GlobalTools::FetchParserTools

      def _fetch_pdb_data(identifierName)
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

    end
  end
end
