class FramesGenomicController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"
  include GlobalTools::FetchParserTools
  def genomicIFrame
    uniprot_acc = params[:uniprot_acc]
    @acc = uniprot_acc
    @message = "USE THE SELECT MENU TO BROWSE PROTEIN ANNOTATIONS"
    if uniprot_acc.nil?
      @alignment = nil
    else
      url = BaseUrl+"/api/mappings/Uniprot/ENSEMBL/transcript/"+uniprot_acc
      jsonData = JSON.parse(getUrl(url))
      if !jsonData['gene'].nil?
        @ensembl_mapping = jsonData
        url = BaseUrl+"/api/alignments/ENSEMBL/"+@ensembl_mapping['gene']['id']+"/"+@ensembl_mapping['transcript'][0]['id']+"/"+uniprot_acc
        jsonData = getUrl(url)
        @alignment = JSON.parse(jsonData)
        @ensembl_select_options = {}
        @ensembl_mapping['transcript'].each do |o|
          @ensembl_select_options[ o['name'] ] = @ensembl_mapping['gene']['id']+"/"+o['id']+"/"+uniprot_acc
        end 

        @selected = @ensembl_mapping['gene']['id']+"/"+@ensembl_mapping['transcript'][0]['id']+"/"+uniprot_acc
        url = BaseUrl+"/api/annotations/ENSEMBL/variation/"+@ensembl_mapping['gene']['id']
        jsonData = getUrl(url)
        @variations = JSON.parse(jsonData)

        @selected = @ensembl_mapping['gene']['id']+"/"+@ensembl_mapping['transcript'][0]['id']+"/"+uniprot_acc
        url = BaseUrl+"/api/annotations/ENSEMBL/annotation/"+@ensembl_mapping['gene']['id']
        jsonData = getUrl(url)
        @annotations = JSON.parse(jsonData)
      else
        @alignment = nil
        @message = "ALIGNMENT BETWEEN UNIPROT AND ENSEMBL NOT FOUND"
      end
    end

  end
end
