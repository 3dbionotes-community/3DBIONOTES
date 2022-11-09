module InfoManager
  module SourceEmdbInfo
    module FetchEmdbSize 

      include EmdbSites
      include GlobalTools::FetchParserTools

      def queryEMDBsize(emdbId)
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
        tmp = {}
        json.each do |k,v|
          if !json["map"].nil?
            if !json["map"]["dimensions"].nil?
              tmp["dimensions"] = json["map"]["dimensions"]
            end
            if !json["map"]["pixel_spacing"].nil?
              tmp["spacing"] = json["map"]["pixel_spacing"]
            end
          end
        end
        maxSize = ""
        myStatus = :not_found
        if !tmp["dimensions"].nil? and !tmp["spacing"].nil?
          col = tmp["dimensions"]["col"].to_f * tmp["spacing"]["y"]["valueOf_"].to_f
          sect = tmp["dimensions"]["sec"].to_f * tmp["spacing"]["x"]["valueOf_"].to_f
          row = tmp["dimensions"]["row"].to_f * tmp["spacing"]["z"]["valueOf_"].to_f
          arr = [col,sect,row]
        end
        return arr.max.to_s
      end

    end 
  end
end
