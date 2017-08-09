module GlobalTools
  module FetchParserTools 

    def generateDigest(cadena)
      return Digest::SHA256.hexdigest(cadena)
    end

    def getUrlWithDigest(url)
      begin
        data = Net::HTTP.get_response(URI.parse(url)).body
        digest = generateDigest(data)
      rescue
        puts "Error downloading data:\n#{$!}"
      end
      return {"data"=>data,"checksum"=>digest}
    end

    def getXml(data)
      begin
        hash = Nori.new(:parser=> :nokogiri, :advanced_typecasting => false).parse(data)
      rescue
        puts "Error downloading and reading xml:\n#{$!}"
      end
      return hash
    end

  end
end
