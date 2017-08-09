module AnnotationManager
  module SourceProteinData
    module SourceMobi 


      MobiURL = "http://mobidb.bio.unipd.it/ws/entries/"

      def sourceMobiFromUniprot(uniprotAc)
        url = MobiURL+"/"+uniprotAc+"/disorder"
        begin
          data = Net::HTTP.get_response(URI.parse(url)).body
        rescue
          puts "Error downloading data:\n#{$!}"
        end   
        data = JSON.parse(data)
        out = {}
        if data.key?("consensus") 
            for j in ['disprot','pdb_nmr','pdb_xray','predictors','long']
              if data['consensus'].key?(j)
                out[j] = []
        	    data['consensus'][j].each do |i|
                  if i['ann'] == "D" or i['ann'] == "d"
        	        out[j].push( {'start'=>i['start'],'end'=>i['end']} )
                  end
        	    end
              end
            end
        end
        return out 
      end

    end 
  end
end
