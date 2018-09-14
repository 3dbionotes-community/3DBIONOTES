class FramesSequenceController < ApplicationController

  include GlobalTools::FetchParserTools
  include AlignmentsManager::BuildAlignments
  BaseUrl = Settings.GS_BaseUrl

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
          json = fetchPDBalignment(@alignment["path"])
          @alignmentData = json[@alignment["pdb"]][@alignment["chain"]][@alignment["uniprot"]]
        else
          json = fetchPDBalignment(@alignment["pdb"])
          if json.key? @alignment["chain"] and json[@alignment["chain"]].key? @alignment["uniprot"] then
            @alignmentData = json[@alignment["chain"]][@alignment["uniprot"]]
          else
            @alignmentData = nil
          end
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
