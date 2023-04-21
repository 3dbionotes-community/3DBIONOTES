module MappingsManager
  module SourceMappings
    module FetchPdbFromEmdb

      include GlobalTools::FetchParserTools
      include MappingsSites
      def queryPDBfromEMDB(emdbId)
        emdbToPDB = Hash.new
        if emdbId =~ /^EMD-\d+$/
          request = makeRequest("https://www.ebi.ac.uk/emdb/api/entry/fitted/",emdbId)
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
          raise Server+EmdbFit+"/"+emdbId+" DID NOT RETURN A JSON OBJECT"
        end
        emdbToPDB[json['emdb_id']]=[json['crossreferences']['pdb_list']['pdb_reference'][0]["pdb_id"]]
        myStatus = :ok
        if emdbToPDB == {}
          myStatus = :not_found
        end
        return emdbToPDB
      end 

    end
  end
end
