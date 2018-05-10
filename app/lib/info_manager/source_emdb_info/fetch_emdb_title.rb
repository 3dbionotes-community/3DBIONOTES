module InfoManager
  module SourceEmdbInfo
    module FetchEmdbTitle 

      include EmdbSites
      include GlobalTools::FetchParserTools

      def queryEMDBtitle(emdbId)
        if emdbId =~ /^EMD-\d{4}$/
          request = makeRequest(EmdbSummaryUrl,emdbId)
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
          raise EmdbSummaryUrl+"/"+emdbId+" DID NOT RETURN A JSON OBJECT"
        end
        title = "Compound title not found"
        json.each do |k,v|
          if !v[0].empty?
            if !v[0]["deposition"].nil?
              title = v[0]["deposition"]["title"].upcase
            end
          end
        end
        return {"title"=>title}
      end

    end 
  end
end
