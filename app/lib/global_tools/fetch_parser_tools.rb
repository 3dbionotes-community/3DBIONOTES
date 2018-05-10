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

    def getFileWithDigest(file)
      data = nil
      digest = nil
      if !File.exist? File.expand_path file
        return {"data"=>data,"checksum"=>digest}
      end
      begin
        data = File.read(file) 
        digest = generateDigest(data)
      rescue
        puts "Error in cat #{file} data:\n#{$!}"
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

    def getUrl(url,verbose=nil)
      if verbose.nil?
        data = ""
        begin
          data = Net::HTTP.get_response(URI.parse(url)).body
        rescue
          puts "Error downloading data:\n#{$!} <<<"
        end
        return data
      else
        data = "error"
        begin
          res = Net::HTTP.get_response( URI.parse(url) )
          data = res.body
          code = res.code
          code_name = res.class.name
        rescue
          puts "Error downloading data:\n#{$!}"
          data = "#{$!}"
        end
        return data, code, code_name
      end
    end  

    def unzipData(data)
      begin
        gz = Zlib::GzipReader.new(StringIO.new(data))
        unzipped = gz.read
      rescue
        puts "Error downloading data:\n#{$!}"
      end
      return unzipped
    end

    def makeRequest(url,input,json_flag=nil)
      #GET
      if input.class == String
        if json_flag.nil?
          begin
            rawData = Net::HTTP.get_response(URI.parse(url+input))
            if rawData.code == "404"
              data = nil
            else
              data = rawData.body
            end
          rescue
            puts "Error: #{$!}"
            raise "URL "+url+input+" NOT ACCESSIBLE"
          end
        else
          begin
            _url = URI.parse(url)
            http = Net::HTTP.new(_url.host, _url.port)
            request = Net::HTTP::Get.new(input, {'Content-Type' => 'application/json'})         
            response = http.request(request)
          rescue
            puts "Error: #{$!}"
            raise "URL "+url+input+" NOT ACCESSIBLE"
          end
          if response.code != "200"
            data= nil
          else
            data = JSON.parse(response.body)
          end
        end
      #POST
      else
        uri = URI.parse(url+"/")
        begin
          data = Net::HTTP.new(uri.host).post(uri.path,input.join(",")).body
        rescue
          puts "Error: #{$!}"
          raise "URL "+url+input+" NOT ACCESSIBLE"
        end
      end
      return data
    end

  end
end
