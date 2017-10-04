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
      hash = {}
      begin
        hash = Nori.new(:parser=> :nokogiri, :advanced_typecasting => false).parse(data)
      rescue
        puts "Error downloading and reading xml:\n#{$!} <<<"
      end
      return hash
    end

    def getUrl(url)
      data = ""
      begin
        data = Net::HTTP.get_response(URI.parse(url)).body
      rescue
        puts "Error downloading data:\n#{$!} <<<"
      end
      return data
    end  

    def makeRequest(url,input)
      #GET
      if input.class == String
        begin
          rawData = Net::HTTP.get_response(URI.parse(url+input))
          if rawData.code == "404"
            data = nil
          else
            data = rawData.body
          end
        rescue
          puts "Error: #{$!}"
        end
      #POST
      else
        uri = URI.parse(url+"/")
        begin
          data = Net::HTTP.new(uri.host).post(uri.path,input.join(",")).body
        rescue
          puts "Error: #{$!}"
        end
      end
      return data
    end

  end
end
