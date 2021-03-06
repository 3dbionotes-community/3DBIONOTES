module AnnotationManager
  module SourceProteinData
    module SourceSmart 

      SmartURL = Settings.GS_SmartURL#"http://smart.embl.de/smart/batch.pl?TEXTONLY=1&INCLUDE_SIGNALP=1&IDS="

      def sourceSmartFromUniprot(uniprotAc)
        out = Smartentry.find_by(proteinId: uniprotAc)
        if out.nil?
          url = SmartURL+uniprotAc
          begin
            data = Net::HTTP.get_response(URI.parse(url)).body
          rescue
            puts "Error downloading data:\n#{$!}"
          end   
          data = data.gsub(/\n\n/,"\n")
          data = data.split("\n")

          k = data.shift()
          while k && k.exclude?("DOMAIN") && k.exclude?("FINISHED") do
            k = data.shift()
          end

          out = []
          while k && k.exclude?("FINISHED") do
            ann = {}
            if k.include?("DOMAIN")
              r = k.split("=")
              ann[r[0].downcase]=r[1]
            end
            k = data.shift()
            while k && k.exclude?("FINISHED") && k.exclude?("DOMAIN") do
              r = k.split("=")
              ann[r[0].downcase]=r[1]       
              k = data.shift()
            end 
            if ann['type'].exclude?("PFAM") && ann['status'].include?("visible") 
              out.push(ann)
            end
          end
          if out.length > 0
            Smartentry.create(proteinId: uniprotAc, data: out.to_json)
          end
        else
          out = JSON.parse(out.data)
        end
        return out 
      end

    end 
  end
end
