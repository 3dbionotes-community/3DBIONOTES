module InfoManager
  module SourceUniprotInfo
    module FetchUniprotAvailty

      include UniprotSites
      include GlobalTools::FetchParserTools

      def queryUNIPROTavailty(acc)
        accInfo = {"id"=>acc,"available"=>false}
        begin
          url = URI.parse(UniprotURL+acc+".fasta")
          req = Net::HTTP.new(url.host, url.port)
          res = req.request_head(url.path)
          if res.code == "200"
            accInfo = {"id"=>acc,"available"=>true}
          else
            accInfo = {"id"=>acc,"available"=>false}
          end
        rescue
          accInfo = {"id"=>acc,"available"=>false, "error"=>$!}
        end
        return accInfo
      end

    end 
  end
end
