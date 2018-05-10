class FramesSequenceController < ApplicationController

  include GlobalTools::FetchParserTools
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
          url = BaseUrl+"api/alignments/PDB/"+@alignment["path"]
          jsonData = getUrl(url)
          begin
            json = JSON.parse(jsonData)
          rescue
            raise url+" DID NOT RETURN A JSON OBJECT"
          end
          @alignmentData = json[@alignment["pdb"]][@alignment["chain"]][@alignment["uniprot"]]
        else
          url = BaseUrl+"api/alignments/PDB/"+@alignment["pdb"]
          jsonData = getUrl(url)
          begin
            json = JSON.parse(jsonData)
          rescue
            raise url+" DID NOT RETURN A JSON OBJECT"
          end
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
