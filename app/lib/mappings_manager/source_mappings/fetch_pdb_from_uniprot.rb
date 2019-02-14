module MappingsManager
  module SourceMappings
    module FetchPdbFromUniprot

      include GlobalTools::FetchParserTools
      include MappingsSites
      include InfoManager::FetchUniprotInfo
      
      def queryPDBfromUniprot(uniprotAc)
        pdbFromUniprot = Hash.new
        if uniprotAc =~ /^[OPQ][0-9][A-Z0-9]{3}[0-9]$|^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/
          request = makeRequest(Server+SIFTSPDB,uniprotAc)
        else
          request = nil
        end
        if request.nil?
          request = "{}"
        end
        json = {}
        begin
          json = JSON.parse(request)
        rescue
          raise Server+SIFTSPDB+"/"+uniprotAc+" DID NOT RETURN A JSON OBJECT"
        end
        json.each do |k,v|
          pdbFromUniprot[k] = {}
          v.each do |el|
            pdbFromUniprot[k][el["pdb_id"]]={"start"=>el["unp_start"],"end"=>el["unp_end"],"chain"=>el["chain_id"],"resolution"=>el["resolution"]}
          end
        end
        if pdbFromUniprot == {}
          is_available = fetchUNIPROTavailty(uniprotAc)
          if is_available.key?('available') && is_available['available'] == true
            pdbFromUniprot={ uniprotAc=>{} }
          end
        end
        return pdbFromUniprot
      end

    end
  end
end
