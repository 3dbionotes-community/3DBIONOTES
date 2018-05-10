class FramesGenomicController < ApplicationController

  include GlobalTools::FetchParserTools

  BaseUrl = Settings.GS_BaseUrl

  def genomicIFrame
    uniprot_acc = params[:uniprot_acc]
    @acc = uniprot_acc
    @message = "USE THE SELECT MENU TO BROWSE PROTEIN ANNOTATIONS"
    if uniprot_acc.nil?
      @alignment = nil
    else
      url = BaseUrl+"/api/mappings/Uniprot/ENSEMBL/transcript/"+uniprot_acc
      begin
        jsonData = JSON.parse(getUrl(url))
      rescue
        raise url+" DID NOT RETURN A JSON OBJECT"
      end
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
        annotations = JSON.parse(jsonData)
        annotations['transcripts']['other_coding']={}
        annotations['transcripts']['coding'].each do |k,v|
          flag = true
          @ensembl_mapping['transcript'].each do |w|
            if k == w['name'] then
              flag = false
            end
          end
          if flag then
            annotations['transcripts']['other_coding'][k]=v
            annotations['transcripts']['coding'].delete(k)
          end
        end
        annotations['transcripts']['non_coding'].each do |k,v|
          flag = false
          @ensembl_mapping['transcript'].each do |w|
            if k == w['name'] then
              flag = true
            end
          end
          if flag then
            annotations['transcripts']['non_coding'].delete(k)
            annotations['transcripts']['coding'][k]=v
          end
        end
        @annotations = annotations
      else
        @alignment = nil
        @message = "ALIGNMENT BETWEEN UNIPROT AND ENSEMBL NOT FOUND"
      end
    end

  end
end
