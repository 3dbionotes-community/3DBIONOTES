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
          if !v[0].empty?
            if !v[0]["map"].nil?
              if !v[0]["map"]["dimensions"].nil?
                tmp["dimensions"] = v[0]["map"]["dimensions"]
              end
              if !v[0]["map"]["pixel_spacing"].nil?
                tmp["spacing"] = v[0]["map"]["pixel_spacing"]
              end
            end
          end
        end
        maxSize = ""
        myStatus = :not_found
        if !tmp["dimensions"].nil? and !tmp["spacing"].nil?
          col = tmp["dimensions"]["column"].to_f * tmp["spacing"]["y"]["value"].to_f
          sect = tmp["dimensions"]["section"].to_f * tmp["spacing"]["x"]["value"].to_f
          row = tmp["dimensions"]["row"].to_f * tmp["spacing"]["z"]["value"].to_f
          arr = [col,sect,row]
        end
        return arr.max.to_s
      end

    end 
  end
end
