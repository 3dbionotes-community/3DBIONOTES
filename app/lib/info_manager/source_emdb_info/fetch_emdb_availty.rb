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
          emdb_url = EMDB_URL+"emd_"+emdb_code+".map.gz"
          # ftp://ftp.ebi.ac.uk/pub/databases/emdb/structures/EMD-20235/map/emd_20235.map.gz
          emdb_url = "ftp://ftp.ebi.ac.uk/pub/databases/emdb/structures/"+"EMD-"+emdb_code+"/map/"+"emd_"+emdb_code+".map.gz"
          url = URI.parse( emdb_url )
          begin 
            # req = Net::HTTP.new(url.host, url.port)

            ftp = Net::FTP.new("ftp.ebi.ac.uk")
            ftp.login
            begin
              dir = "pub/databases/emdb/structures/EMD-"+emdb_code+"/map"
              files = ftp.chdir(dir)
              # files = ftp.list("*.map.gz")
              file_size = ftp.size("emd_"+emdb_code+".map.gz")
            rescue Exception => e
              reply = e.message
              err_code = reply[0,3].to_i
              emdbInfo = {"id"=>emdbId,"available"=>false, "error"=>"HTTP ERROR "+"Not Found in "+ dir}
              myStatus = :not_found
              # unless err_code == 500 || err_code == 502
              #   # other problem, raise
              #   raise 
              end
              # fallback solution 
            end
              emdbInfo = {"id"=>emdbId,"available"=>true}
              ftp.close

            # req.use_ssl = true
            # res = req.request_head(url.path)
          # rescue
          #   emdbInfo = {"id"=>emdbId,"available"=>false, "error"=>"HTTP ERROR "+err_code}
          #   myStatus = :not_found
          # end
          # if res.code == "200" 
          #   emdbInfo = {"id"=>emdbId,"available"=>true}
          # else
          #   emdbInfo = {"id"=>emdbId,"available"=>false}
          # end
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
