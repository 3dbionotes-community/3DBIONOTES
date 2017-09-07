module InfoManager
  module SourceEmdbInfo
    module FetchEmdbAvailty

      include EmdbSites
      include GlobalTools::FetchParserTools

      def queryEMDBavailty(emdbId)
        emdbInfo = {}
        if emdbId =~ /^EMD-\d{4}$/
          emdb_code  = emdbId[4..emdbId.length]
          emdb_url = "http://www.ebi.ac.uk/pdbe/static/files/em/maps/emd_"+emdb_code+".map.gz"
          url = URI.parse( emdb_url )
          begin 
            req = Net::HTTP.new(url.host, url.port)
            res = req.request_head(url.path)
          rescue
            emdbInfo = {"id"=>emdbId,"available"=>false, "error"=>"HTTP ERROR"}
            myStatus = :not_found
            return render json: emdbInfo, status: myStatus
          end
          if res.code == "200" 
            emdbInfo = {"id"=>emdbId,"available"=>true}
          else
            emdbInfo = {"id"=>emdbId,"available"=>false}
          end
        else
          emdbInfo = {"id"=>emdbId,"available"=>false, "error"=>"UNKNOWN EMDB ID"} 
        end
 
        url = BaseUrl+"api/mappings/EMDB/PDB/"+emdbId
        jsonData = getUrl(url)
        pdbData = JSON.parse(jsonData)
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
          titlePDBJson = JSON.parse(jsonData)
          if titlePDBJson["available"] != true and emdbInfo["available"] == true
            emdbInfo["available"] = false
          end
        end
        return emdbInfo 
      end

    end 
  end
end
