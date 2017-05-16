class FramesSequenceController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"

  helper_method :getUrl

  def getUrl(url)
    starts = Time.now.to_i
    verbose = 0
    if params[:verbose] or request.port==3000
      verbose = 1
    end
    if params[:debug_id]
      data = Net::HTTP.get_response(URI.parse("http://3dbionotes.cnb.csic.es:8000/?debug_id="+params[:debug_id]+"&message=sequenceIFrame::"+url)).body
      puts data
    end
    if verbose == 1
      puts "\n\n==========================================================\n"
      puts url
      puts "==========================================================\n\n"
    end
    begin
      data = Net::HTTP.get_response(URI.parse(url)).body
    rescue
      puts "Error downloading data:\n#{$!}"
    end
    if verbose == 1
      puts "\n\n==========================================================\nDONE\n==========================================================\n\n"
    end
    ends = Time.now.to_i
    total = ends-starts
    @log += "console.log('"+url+" - "+total.to_s+"s');"
    return data
  end

  def sequenceIFrame
    @paramAlignment = params[:alignment]
    @imported_flag = false
    if params[:imported_flag]
      @imported_flag = params[:imported_flag]
    end
    @log = ""
    if !@paramAlignment.nil?
      @alignment = JSON.parse(@paramAlignment)
      if !@alignment["pdb"].nil? and !@alignment["uniprot"].nil?
        
        if @alignment["path"]
          url = BaseUrl+"api/alignments/PDB/"+@alignment["path"]
          jsonData = getUrl(url)
          @alignmentData = JSON.parse(jsonData)[@alignment["pdb"]][@alignment["chain"]][@alignment["uniprot"]]
        else
          url = BaseUrl+"api/alignments/PDB/"+@alignment["pdb"]
          jsonData = getUrl(url)
          @alignmentData = JSON.parse(jsonData)[@alignment["chain"]][@alignment["uniprot"]]
        end

        if @alignmentData.nil?
          url = BaseUrl+"api/info/Uniprot/"+@alignment["uniprot"]
          jsonData = getUrl(url)
          @alignmentData = {}
          @alignmentData["uniprotSeq"] = jsonData
          @alignmentData["pdbSeq"] = "-"*jsonData.length
        end
      elsif @alignment["pdb"].nil? and !@alignment["uniprot"].nil?
        url = BaseUrl+"api/info/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        @alignmentData = {}
        @alignmentData["uniprotSeq"] = jsonData
        @alignmentData["pdbSeq"] = "-"*jsonData.length
      end
    end
  end
end
