class FramesSequenceController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"

  helper_method :getUrl

  def getUrl(url)
    begin
      data = Net::HTTP.get_response(URI.parse(url)).body
    rescue
      puts "Error downloading data:\n#{$!}"
    end
    return data
  end

  def sequenceIFrame
    @paramAlignment = params[:alignment]
    if !@paramAlignment.nil?
      @alignment = JSON.parse(@paramAlignment)
      if !@alignment["pdb"].nil? and !@alignment["uniprot"].nil?
        url = BaseUrl+"api/alignments/PDB/"+@alignment["pdb"]
        jsonData = getUrl(url)
        @alignmentData = JSON.parse(jsonData)[@alignment["chain"]][@alignment["uniprot"]]
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
