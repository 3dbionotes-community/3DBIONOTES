class PostRequestController < ApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:upload]

  BaseUrl = "http://3dbionotes.cnb.csic.es/"
  LocalPath =  "/home/joan/apps/bionotes/public/upload/"

  include GlobalTools::FetchParserTools
  include ProteinManager::BlastSearch

  def upload
    if !params[:structure_file].nil?
      rand_path = (0...20).map { ('a'..'z').to_a[rand(26)] }.join.upcase
      original_filename = params[:structure_file].original_filename
      if original_filename.include? "cif"
        file_name = "structure_file.cif"
      else
        file_name = "structure_file.pdb"
      end
      title = "File "+params[:structure_file].original_filename
      if params[:title] && params[:title].length>0
        title = params[:title]
      end

      DataFile.save(params[:structure_file], file_name,rand_path, post_info={"title"=>title, "file_name"=>file_name})

      toReturn = { "id"=>rand_path, "file_name"=>original_filename, "title"=>title}
      return render json: toReturn.to_json, status: :ok
    else
      return render json: {"error"=>"Structure file not found in POST request"}, status: :ok
    end
  end

  def fetch
    if request.referer
      logger.info("  HTTP Referer: #{request.referer}") 
    end
    if !params[:url].nil?
      url = params[:url]
      file_content, http_code, http_code_name = getUrl(url,verbose=true)
      if http_code.to_i > 399
        return render json: {"error"=>"URL "+url+" was not reachable", "http_error"=>http_code_name}, status: :ok
      elsif http_code.to_i == 0
        return render json: {"error"=>"ruby exception", "url"=> params[:url], "exception"=>file_content}, status: :ok
      else
        rand_path = (0...20).map { ('a'..'z').to_a[rand(26)] }.join.upcase

        original_filename = url
        if original_filename.include? "cif"
          file_name = "structure_file.cif"
        else
          file_name = "structure_file.pdb"
        end

        title = "File "+url
        if params[:title] && params[:title].length>0
          title = params[:title]
        end

        DataFile.save_string(file_content, file_name, rand_path, post_info={ "title"=>title, "file_name"=>file_name })

        toReturn = { "id"=>rand_path, "file_name"=>original_filename, "title"=>title }
        return render json: toReturn.to_json, status: :ok
      end
    else
      return render json: {"error"=>"URL structure file not found in your request"}, status: :ok
    end
  end

  def browse
    if request.referer
      logger.info("  HTTP Referer: #{request.referer}") 
    end
    rand_path = params[:id]
    recover_data = recover(rand_path)
    file_name =  recover_data['file_name']
    title = recover_data['title']

    @title = title
    @rand  = rand_path
    @file = file_name 
    @structure_file = '/home/joan/apps/bionotes/public/upload/'+rand_path+'/'+file_name
    @http_structure_file = BaseUrl+'/upload/'+rand_path+'/'+file_name
    @mapping  =  JSON.parse(`structure_to_fasta_json #{@structure_file}`)
    @error = nil
    if @mapping.has_key? "error"
      @error = @mapping["error"]
    else 
      @sequences = @mapping['sequences']
      @choice = {}
      do_not_repeat = {}
      @sequences.each do |ch,seq|
        if  do_not_repeat.key?(seq)
          @choice[ch] = do_not_repeat[seq]
        else
          blast_results = runBlast(seq, name=nil, thr=0)
          @choice[ch] = ( blast_results.sort_by{ |k| -k['cov'].to_f } )
          if @choice[ch]!=nil && @choice[ch].length>0
            do_not_repeat[seq] = @choice[ch]
          end
        end
      end
      @viewerType = "ngl"
    end
    render :layout => 'main', :template => 'main/upload'
  end

  def recover(rand)
    recover_data = JSON.parse( File.read(LocalPath+"/"+rand+"/post_info.json") )
    return recover_data
  end

end
