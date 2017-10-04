class FramesGenomicController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"

  helper_method :getUrl
  helper FramesHelper
  $verbose = 0 
  def getUrl(url)
    begin
      if $verbose ==1 || request.port==3000
        puts "\n======================================\n"
        puts url
        puts "\n======================================\n"
      end
      data = Net::HTTP.get_response(URI.parse(url)).body
      if $verbose == 1 || request.port==3000
        puts "\nDONE!!!!\n"
      end
    rescue
      puts "Error downloading data:\n#{$!}"
    end
    if $verbose == 1
        puts data+"\n"
    end
    return data
  end

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
