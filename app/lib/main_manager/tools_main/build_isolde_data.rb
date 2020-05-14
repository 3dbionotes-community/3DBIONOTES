module MainManager
  module ToolsMain
    module BuildIsoldeData

      include MainManager::SourceMain::MainSites  
      include GlobalTools::FetchParserTools

      def _fetch_isolde_data(isoldeIdentifierName)
        identifierName = isoldeIdentifierName.last(4) 

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
        # url = "http://campins.cnb.csic.es:8080/api/mappings/PDB/Uniprot/"+identifierName
        jsonData = getUrl(url)
        jsonData.to_s.encode('UTF-8', invalid: :replace, undef: :replace, replace: '?')
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
            @noAlignments = true
          else
            url = BaseUrl+"api/lengths/UniprotMulti/"+options.keys.uniq.join(",")
            jsonData = getUrl(url)
            uniLengths = JSON.parse(jsonData)
            chain_flag = {}
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
                if not chain_flag.key? chain then
                  @optionsArray.push(["#{chain} - #{ali["gene_symbol"]}, #{ali["uniprotTitle"]}",ali.to_json])
                  chain_flag[chain] = true
                end
              end
            end
          end
        end
      end

    end
  end
end
