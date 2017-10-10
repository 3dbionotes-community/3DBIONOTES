module MainManager
  module ToolsMain
    module BuildUniprotData

      include MainManager::SourceMain::MainSites  
      include GlobalTools::FetchParserTools

      def _fetch_uniprot_data(identifierName)
        @badName = false
        options = Hash.new
        url = BaseUrl+"api/mappings/Uniprot/PDB/"+identifierName
        jsonData = getUrl(url)
        mappingData = JSON.parse(jsonData)
        url = BaseUrl+"/api/lengths/UniprotMulti/"+identifierName
        jsonData = getUrl(url)
        uniLength = JSON.parse(jsonData)
        if uniLength.length == 0
          @isAvailable = false
          @notExists = true
        else
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

    end
  end
end
