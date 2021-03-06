module InfoManager
  module SourcePdbInfo
    module FetchPdbTitle

      include PdbSites
      include GlobalTools::FetchParserTools

      def queryPDBtitle(pdb)
        request = makeRequest(PdbSummaryUrl,pdb)
        json = {}
        if request
          json = {}
          begin
            json = JSON.parse(request)
          rescue
            raise PdbSummaryUrl+"/"+pdb+" DID NOT RETURN A JSON OBJECT"
          end
        end
        title = "Compound title not found"
        json.each do |k,v|
          if !v[0].empty?
            title = v[0]["title"].upcase
          end
        end
        return {"title"=>title}
      end

    end 
  end
end
