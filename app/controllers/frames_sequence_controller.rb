class FramesSequenceController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"
  include GlobalTools::FetchParserTools

  def sequenceIFrame
    @paramAlignment = params[:alignment]
    @imported_flag = false
    if params[:imported_flag]
      @imported_flag = params[:imported_flag]
    end
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
