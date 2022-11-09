module InfoManager
  module SourceEmdbInfo
    module FetchEmdbTitle 

      include EmdbSites
      include GlobalTools::FetchParserTools

      def queryEMDBtitle(emdbId)
        if emdbId =~ /^EMD-\d{4,5}$/
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
        title = json["admin"]["title"].upcase
        return {"title"=>title}
      end

    end 
  end
end
