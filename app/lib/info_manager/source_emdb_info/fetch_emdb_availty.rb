module InfoManager
  module SourceEmdbInfo
    module FetchEmdbAvailty

      require 'net/ftp'

      EMDB_URL = Settings.GS_EMDB

      include EmdbSites
      include GlobalTools::FetchParserTools

      def queryEMDBavailty(emdbId)
        emdbInfo = {}
        if emdbId =~ /^EMD-\d{4,5}$/  
          emdb_code  = emdbId[4..emdbId.length]
          emdb_url = EMDB_URL+"EMD-"+emdb_code+"/map/"+"emd_"+emdb_code+".map.gz"
          url = URI.parse( emdb_url )
          begin
            ftp = Net::FTP.new(url.host)
            ftp.login
            begin
              file_size = ftp.size(url.path)  # will fail if file does not exist
            rescue Exception => e
              reply = e.message
              err_code = reply[0,3].to_i
              emdbInfo = {"id"=>emdbId,"available"=>false, "error"=>"HTTP ERROR "+"Not Found in "+ url.path}
              myStatus = :not_found
            end
              emdbInfo = {"id"=>emdbId,"available"=>true,
                          "file_size"=>file_size,
                          "url"=>emdb_url}
              ftp.close
          rescue
            emdbInfo = {"id"=>emdbId,"available"=>false, "error"=>"HTTP ERROR "+err_code}
            myStatus = :not_found
          end
        else
          emdbInfo = {"id"=>emdbId,"available"=>false, "error"=>"UNKNOWN EMDB ID"} 
        end
 
        url = BaseUrl+"api/mappings/EMDB/PDB/"+emdbId
        jsonData = getUrl(url)
        pdbData = {}
        begin
          pdbData = JSON.parse(jsonData)
        rescue
          raise url+" DID NOT RETURN A JSON OBJECT"
        end
        pdbs = []
        if pdbData.has_key?(emdbId)
          pdbs = pdbData[emdbId]
        end

        if pdbs.length == 0
          emdbInfo["fitted_pdb"] = false
        else
          emdbInfo["fitted_pdb"] = true
        end
        pdbs.each do |__pdb|
          url = BaseUrl+"api/info/PDB/available/"+__pdb.downcase
          jsonData = getUrl(url)
          titlePDBJson = {}
          begin
            titlePDBJson = JSON.parse(jsonData)
          rescue
            raise url+" DID NOT RETURN A JSON OBJECT"
          end
          if titlePDBJson["available"] != true and emdbInfo["available"] == true
            emdbInfo["available"] = false
          end
        end
        return emdbInfo 
      end

    end 
  end
end
