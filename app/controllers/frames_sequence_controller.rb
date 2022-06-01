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
          if @alignment["path"].include? "isolde"
            pdb = @alignment["path"].split(//).last(4).join
            json = fetchPDBalignment(pdb)
            @alignmentData = json[@alignment["chain"]][@alignment["uniprot"]]
          elsif @alignment["path"].include? "REFMAC"
              pdb = @alignment["path"].split(//).last(4).join
              json = fetchPDBalignment(pdb)
              @alignmentData = json[@alignment["chain"]][@alignment["uniprot"]]
          elsif @alignment["path"].include? "swiss-model" or
                @alignment["path"].include? "AlphaFold" or
                @alignment["path"].include? "BSM-Arc"
            url = BaseUrl+"api/info/Uniprot/"+@alignment["uniprot"]
            jsonData = getUrl(url)
            @alignmentData = {}
            @alignmentData["uniprotSeq"] = jsonData
            @alignmentData["pdbSeq"] = "-"*jsonData.length
          else
            json = fetchPDBalignment(@alignment["path"])
            @alignmentData = json[@alignment["pdb"]][@alignment["chain"]][@alignment["uniprot"]]
          end
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
