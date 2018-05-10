module InfoManager
  module SourceEmdbInfo
    module FetchEmdbThr 

      include EmdbSites
      include GlobalTools::FetchParserTools

      def queryEMDBthr(emdbId)
        if emdbId =~ /^EMD-\d+$/
          request = makeRequest(EmdbMapUrl,emdbId)
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
          raise EmdbMapUrl+"/"+emdbId+" DID NOT RETURN A JSON OBJECT"
        end
        emdbInfo = {}
        json.each do |k,v|
          if !v[0].empty?
            if !v[0]["map"].nil?
              if !v[0]["map"]["contour_level"].nil?
                emdbInfo["contour"]=v[0]["map"]["contour_level"]["value"]
              end
              if !v[0]["map"]["statistics"].nil?
                emdbInfo["limits"] = {}
                emdbInfo["limits"]["start"] = v[0]["map"]["statistics"]["minimum"]
                emdbInfo["limits"]["end"] = v[0]["map"]["statistics"]["maximum"]
              end
            end
          end
        end
        myStatus = :ok
        if emdbInfo == {}
          myStatus = :not_found
        end
        return emdbInfo 
      end

    end 
  end
end
