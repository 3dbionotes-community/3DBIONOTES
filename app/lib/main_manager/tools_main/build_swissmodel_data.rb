module MainManager
  module ToolsMain
    module BuildSwissmodelData

      include MainManager::SourceMain::MainSites  
      include GlobalTools::FetchParserTools

      def _fetch_swissmodel_data(identifierName)
        # identifierName.slice! "SWISSMODEL-"
        ids = identifierName.split('-')
        modelType = ids.shift
        identifierName = ids.shift
        projectId = ids.shift
        modelId = ids.shift

        @badName = false
        options = Hash.new
        url = BaseUrl+"/api/mappings/Uniprot/PDB/"+identifierName
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
          @notExists = false 
          options = []
          if mappingData.has_key?(identifierName) then
            options = mappingData[identifierName]
          end
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
            @optionsArray.push(["No structural data is available, displaying Uniprot annotations",ali.to_json])
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
