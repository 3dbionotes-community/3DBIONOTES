module MappingsManager
  module SourceMappings
    module FetchUniprotFromPdb

      include GlobalTools::FetchParserTools
      include MappingsSites
      include InfoManager::FetchPdbInfo

      def queryUniprotfromPDB(pdbId)
        uniprotFromPDB = Hash.new
        if pdbId =~ /^\d{1}\w{3}$/
          request = makeRequest(Server+SIFTSUniprot,pdbId)
        else
          request = {}
        end
        if request.nil?
          request = "{}"
        end
        json = {}
        begin
          json = JSON.parse(request)
        rescue
          raise Server+SIFTSUniprot+"/"+pdbId+" DID NOT RETURN A JSON OBJECT"
        end
        json.each do |k,v|
          uniprotFromPDB[k] = Hash.new
          v["UniProt"].each do |ki,vi|
            if uniprotFromPDB[k][ki].nil?
              uniprotFromPDB[k][ki] = Array.new
            end
            vi["mappings"].each do |mapping|
              uniprotFromPDB[k][ki].push(mapping["chain_id"])
            end
          end
        end
        if uniprotFromPDB == {}
          is_available = fetchPDBavailty(pdbId)
          if is_available.key?('available') && is_available['available'] == true
            uniprotFromPDB = {pdbId=>[]}
          end
        end
        return uniprotFromPDB
      end 

    end
  end
end
