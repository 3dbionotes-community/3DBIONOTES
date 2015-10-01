class FramesController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"

  helper_method :getUrl
  helper FramesHelper

  def getUrl(url)
    begin
      data = Net::HTTP.get_response(URI.parse(url)).body
    rescue
      puts "Error downloading data:\n#{$!}"
    end
    return data
  end

  def iframeAnnots
    alignment = params[:alignment]
    uniprotLength = params[:length]
    if !alignment.nil? and !uniprotLength.nil?
      @alignment = JSON.parse(alignment)
      @uniprotLength = uniprotLength
      @annotsData = Hash.new
      @generalData = Hash.new
      # PARA UNIPROT
      if !@alignment["uniprot"].nil?
        url = BaseUrl+"api/annotations/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        processedJson = JSON.parse(jsonData)
        @generalData["uniprot"] = processedJson["general"]
        @annotsData["uniprot"] = processedJson["particular"].group_by{|x| x["type"]}
        url = BaseUrl+"api/annotations/IEDB/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        if jsonData!="[]"
          jsonDataParsed = JSON.parse(jsonData)
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
        url = BaseUrl+"api/annotations/biomuta/Uniprot/"+@alignment["uniprot"]
        jsonData = getUrl(url)
        if jsonData!="[]"
          jsonDataParsed = JSON.parse(jsonData)
          @annotsData["biomuta"] = jsonDataParsed.group_by{|x| x["type"]}
        else
          @annotsData["biomuta"] = []
        end
      end
    elsif !alignment.nil?
      @alignment = JSON.parse(alignment)
    end
  end 

end
