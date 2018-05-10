module AnnotationManager
  module SourceProteinData
    module SourcePfam 

      PfamURL = Settings.GS_PfamURL#"http://pfam.xfam.org/"

      def getPfamInfo(pfam_acc)
        url = PfamURL+"family/"+pfam_acc+"?output=xml"
        begin
          data = Net::HTTP.get_response(URI.parse(url)).body
        rescue
          puts "Error downloading data:\n#{$!}"
        end   
        hash = Nori.new(:parser=> :nokogiri, :advanced_typecasting => false).parse(data)   
        description = hash["pfam"]["entry"]["description"].gsub(/\n/, "")
        category = []
        if hash["pfam"]["entry"].key?("go_terms") && hash["pfam"]["entry"]["go_terms"]["category"].class == Hash
          category = [ hash["pfam"]["entry"]["go_terms"]["category"] ]
        elsif hash["pfam"]["entry"].key?("go_terms")
          category = hash["pfam"]["entry"]["go_terms"]["category"]
        end
        go = {}
        category.each do |c|
          go_class = c["@name"]
          go[ go_class ] = []

          if c["term"].class != Array
            terms = [ c["term"] ]
          else
            terms = c["term"]
          end
          terms.each do |t|
            go[ go_class ].push( t )
          end
        end

        out = {'description'=>description,'go'=>go}
        return out
      end

      def sourcePfamFromUniprot(uniprotAc)
        out = Pfamentry.find_by(proteinId: uniprotAc)
        if out.nil?
          url = PfamURL+"protein/"+uniprotAc+"?output=xml"
          begin
            data = Net::HTTP.get_response(URI.parse(url)).body
          rescue
            puts "Error downloading data:\n#{$!}"
          end   
          hash = Nori.new(:parser=> :nokogiri, :advanced_typecasting => false).parse(data)
          data = []
          if  !hash.nil? && !hash["pfam"].nil? && !hash["pfam"]["entry"].nil? && hash["pfam"]["entry"].key?("matches") && hash["pfam"]["entry"]["matches"]["match"].class == Hash
            data = [ hash["pfam"]["entry"]["matches"]["match"] ]
          elsif !hash.nil? && !hash["pfam"].nil? && !hash["pfam"]["entry"].nil? && hash["pfam"]["entry"].key?("matches")
            data  = hash["pfam"]["entry"]["matches"]["match"]
          end
          out = []
          data.each do |i|
            info = getPfamInfo( i['@accession'] )
            out.push( {'start'=>i['location']['@start'],'end'=>i['location']['@end'],'acc'=>i['@accession'],'id'=>i['@id'], 'info'=>info} )
          end
          if out.length > 0
            Pfamentry.create(proteinId: uniprotAc, data: out.to_json)
          end
        else
          out = JSON.parse(out.data)
        end
        return out 
      end

    end 
  end
end
