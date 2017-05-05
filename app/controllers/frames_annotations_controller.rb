class FramesAnnotationsController < ApplicationController

  BaseUrl = "http://3dbionotes.cnb.csic.es/"

  helper_method :getUrl
  helper FramesHelper

  def getUrl(url)
    starts = Time.now.to_i
    verbose = 0 
    data = ""
    if params[:debug_id]
      data = Net::HTTP.get_response(URI.parse("http://3dbionotes.cnb.csic.es:8000/?debug_id="+params[:debug_id]+"&message=iannotationsIFrame::"+url)).body
      puts data
    end
    if params[:verbose] or request.port==3000
      verbose = 1
    end
    if verbose == 1
      puts "\n\n==========================================================\n"
      puts url
      puts "==========================================================\n\n"
    end
    begin
      uri = URI.parse(url)
      request = Net::HTTP.start(uri.host, uri.port) do |http|
        http.read_timeout = 6
        http.get(uri)
      end
      data = request.body
    rescue
      puts "Error downloading data:\n#{$!}"
      data = '[]'
    end
    if verbose == 1
      puts "\n\n==========================================================\nDONE\n==========================================================\n\n"
    end
    if data.length == 0
      data = '[]'
    end 
    ends = Time.now.to_i
    total = ends-starts
    @log += "console.log('"+url+" - "+total.to_s+"s');"
    return data
  end

  def annotationsIFrame
    alignment = params[:alignment]
    uniprotLength = params[:length]
    if !alignment.nil? and !uniprotLength.nil?
      @alignment = JSON.parse(alignment)
      @uniprotLength = uniprotLength
      @annotsData = Hash.new
      @generalData = Hash.new
      @log = ""
      if !@alignment["uniprot"].nil?
        @uniprotACC = @alignment["uniprot"]
        @allURL = []
        @allURL.push(["iedb","/api/annotations/IEDB/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["phosphosite", "/api/annotations/Phosphosite/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["dbptm", "/api/annotations/dbptm/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["biomuta", "/api/annotations/biomuta/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["dsysmap", "/api/annotations/dsysmap/Uniprot/"+@alignment["uniprot"],true])
        if @alignment["pdb"] and not @alignment["path"]
	  @allURL.push(["coverage", "/api/alignments/Coverage/"+@alignment["pdb"].downcase+@alignment["chain"],false])
        elsif @alignment["pdb"] and @alignment["path"]
          @allURL.push(["coverage", "/api/alignments/Coverage/"+@alignment["path"]+"::"+@alignment["pdb"].gsub!('.', '_dot_')+"::"+@alignment["chain"],false])
        end
        @allURL.push(["elmdb", "/api/annotations/elmdb/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["Pfam", "/api/annotations/Pfam/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["mobi", "/api/annotations/mobi/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["smart", "/api/annotations/SMART/Uniprot/"+@alignment["uniprot"],true])
        @allURL.push(["interpro", "/api/annotations/interpro/Uniprot/"+@alignment["uniprot"],true])
      end
    end
    @allURL = @allURL.to_json
  end
end
