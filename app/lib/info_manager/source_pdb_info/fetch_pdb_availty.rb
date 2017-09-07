module InfoManager
  module SourcePdbInfo
    module FetchPdbAvailty

      include PdbSites
      include GlobalTools::FetchParserTools

      def queryPDBavailty(pdb)
        pdbInfo = {}
        if pdb =~ /^\d{1}\w{3}$/ and pdb !~ /^\d{4}$/
          url = URI.parse("http://www.ebi.ac.uk/pdbe/entry-files/download/"+params[:name].downcase+".cif")
          begin
            req = Net::HTTP.new(url.host, url.port)
            res = req.request_head(url.path)
          rescue
            pdbInfo = {"id"=>pdb,"available"=>false, "error"=>"HTTP ERROR"}
            myStatus = :not_found
            return render json: pdbInfo, status: myStatus
          end
          if res.code == "200"
            pdbInfo = {"id"=>pdb,"available"=>true}
          else
            pdbInfo = {"id"=>pdb,"available"=>false}
          end
        else
          pdbInfo = {"id"=>pdb,"available"=>false, "error"=>"UNKNOWN PDB ID"}
        end

        return pdbInfo
      end

    end 
  end
end
