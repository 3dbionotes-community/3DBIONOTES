class FramesAnnotationsController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"

  helper_method :getUrl
  helper FramesHelper



  def getUrl(url)
    starts = Time.now.to_i
    verbose = 0 
    data = ""
    if params[:debug_id]
      data = Net::HTTP.get_response(URI.parse("http://3dbionotes.cnb.csic.es:8000/?debug_id="+params[:debug_id]+"&message=iannotationsIFrame::"+url)).body
      puts data
    end
    if params[:verbose] or request.port==3000
      verbose = 1
    end
    if verbose == 1
      puts "\n\n==========================================================\n"
      puts url
      puts "==========================================================\n\n"
    end
    begin
      uri = URI.parse(url)
      request = Net::HTTP.start(uri.host, uri.port) do |http|
        http.read_timeout = 6
        http.get(uri)
      end
      data = request.body
    rescue
      puts "Error downloading data:\n#{$!}"
      data = '[]'
    end
    if verbose == 1
      puts "\n\n==========================================================\nDONE\n==========================================================\n\n"
    end
    if data.length == 0
      data = '[]'
    end 
    ends = Time.now.to_i
    total = ends-starts
    @log += "console.log('"+url+" - "+total.to_s+"s');"
    return data
  end

  def annotationsIFrame
    alignment = params[:alignment]
    uniprotLength = params[:length]
    if !alignment.nil? and !uniprotLength.nil?
      @alignment = JSON.parse(alignment)
      @uniprotLength = uniprotLength
      @annotsData = Hash.new
      @generalData = Hash.new
      @log = ""
      if !@alignment["uniprot"].nil?
        @uniprotACC = @alignment["uniprot"]

        url = BaseUrl+"api/annotations/IEDB/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        if jsonData!="[]"
          jsonDataParsed = JSON.parse(jsonData)
          __aux = jsonDataParsed.group_by{|x| x["type"]}
          @annotsData["iedb"] = jsonDataParsed.group_by{|x| x["type"]}
        else
          @annotsData["iedb"] = []
        end

        url = BaseUrl+"api/annotations/Phosphosite/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        if jsonData!="[]"
          jsonDataParsed = JSON.parse(jsonData)
          @annotsData["phosphosite"] = jsonDataParsed.group_by{|x| x["type"]}
        else
          @annotsData["phosphosite"] = []
        end

        url = BaseUrl+"api/annotations/dbptm/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        if jsonData!="[]"
          jsonDataParsed = JSON.parse(jsonData)
          @annotsData["dbptm"] = jsonDataParsed
        else
          @annotsData["dbptm"] = []
        end

        url = BaseUrl+"api/annotations/biomuta/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        if jsonData!="[]"
          jsonDataParsed = JSON.parse(jsonData)
          @annotsData["biomuta"] = jsonDataParsed.group_by{|x| x["type"]}
        else
          @annotsData["biomuta"] = []
        end

        url = BaseUrl+"api/annotations/dsysmap/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        if jsonData!="[]"
          jsonDataParsed = JSON.parse(jsonData)
          @annotsData["dsysmap"] = jsonDataParsed.group_by{|x| x["type"]}
        else
          @annotsData["dsysmap"] = []
        end
        
        if @alignment["pdb"] and not @alignment["path"]
	  url = BaseUrl+"api/alignments/Coverage/"+@alignment["pdb"].downcase+@alignment["chain"]
          jsonData = getUrl(url)
          if jsonData!="[]"
            jsonDataParsed = JSON.parse(jsonData)
            @annotsData["coverage"] = jsonDataParsed 
          else
            @annotsData["coverage"] = [] 
          end
        elsif @alignment["pdb"] and @alignment["path"]
          url = BaseUrl+"api/alignments/Coverage/"+@alignment["path"]+"::"+@alignment["pdb"].gsub!('.', '_dot_')+"::"+@alignment["chain"]
          puts(url)
          jsonData = getUrl(url)
          if jsonData!="[]"
            jsonDataParsed = JSON.parse(jsonData)
            @annotsData["coverage"] = jsonDataParsed 
          else
            @annotsData["coverage"] = [] 
          end
        else
            @annotsData["coverage"] = []
        end

        url = BaseUrl+"api/annotations/elmdb/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        if jsonData!="[]"
          jsonDataParsed = JSON.parse(jsonData)
          @annotsData["elmdb"] = jsonDataParsed
        else
          @annotsData["elmdb"] = []
        end

        url = BaseUrl+"api/annotations/Pfam/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        if jsonData!="[]"
          jsonDataParsed = JSON.parse(jsonData)
          @annotsData["Pfam"] = jsonDataParsed
        else
          @annotsData["Pfam"] = []
        end

        url = BaseUrl+"api/annotations/mobi/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        if jsonData!="[]"
          jsonDataParsed = JSON.parse(jsonData)
          @annotsData["mobi"] = jsonDataParsed
        else
          @annotsData["mobi"] = []
        end

        url = BaseUrl+"api/annotations/SMART/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        if jsonData!="[]"
          jsonDataParsed = JSON.parse(jsonData)
          @annotsData["smart"] = jsonDataParsed
        else
          @annotsData["smart"] = []
        end

        url = BaseUrl+"api/annotations/interpro/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        if jsonData!="[]"
          jsonDataParsed = JSON.parse(jsonData)
          @annotsData["interpro"] = jsonDataParsed
        else
          @annotsData["interpro"] = []
        end

      end
    end
    @annotsData = @annotsData.to_json
  end
end
