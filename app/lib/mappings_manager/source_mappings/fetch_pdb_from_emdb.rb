module MappingsManager
  module SourceMappings
    module FetchPdbFromEmdb

      include GlobalTools::FetchParserTools
      include MappingsSites
      def queryPDBfromEMDB(emdbId)
        emdbToPDB = Hash.new
        if emdbId =~ /^EMD-\d+$/
          request = makeRequest(Server+EmdbFit,emdbId)
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
        #json = JSON.parse(request)
        json.each do |k,v|
          tmpArray = []
          v.each do |fit|
            if fit != {}
              tmpArray+=fit["fitted_emdb_id_list"]["pdb_id"]
            end
          end
          emdbToPDB[k]=tmpArray
        end
        myStatus = :ok
        if emdbToPDB == {}
          myStatus = :not_found
        end
        return emdbToPDB
      end 

    end
  end
end
