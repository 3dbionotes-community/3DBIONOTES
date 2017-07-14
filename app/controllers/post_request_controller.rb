class PostRequestController < ApplicationController
  skip_before_filter :verify_authenticity_token, :only => [:upload]

  BaseUrl = "http://3dbionotes.cnb.csic.es/"
  LocalPath =  "/home/joan/apps/bionotes/public/upload/"

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

  def browse
    rand_path = params[:id]
    recover_data = recover(rand_path)
    file_name =  recover_data['file_name']
    title = recover_data['title']

    @title = title
    @rand  = rand_path
    @file = file_name 
    @structure_file = '/home/joan/apps/bionotes/public/upload/'+rand_path+'/'+file_name
    @http_structure_file = 'http://3dbionotes.cnb.csic.es/upload/'+rand_path+'/'+file_name
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
          #sprot
          blast = `ssh jsegura@campins 'echo #{seq} | sudo nice -n -10 ~/app/BLAST/ncbi-blast-2.5.0+/bin/blastp -num_threads 32 -task blastp-fast -query - -db ~/databases/UNIPROT/blast/sprot/sprot -outfmt "7 sacc stitle evalue pident qstart qend" -max_target_seqs 20 -qcov_hsp_perc 80 | grep -v "#"'`
          sprot, flag = parse_blast(blast,'sprot')
          if sprot.length > 0
            @choice[ch] = ( sprot.sort_by{ |k| -k['cov'].to_f } )
          end
          #trembl
          if !flag
            blast = `ssh jsegura@campins 'echo #{seq} | sudo nice -n -10 ~/app/BLAST/ncbi-blast-2.5.0+/bin/blastp -num_threads 32 -task blastp-fast -query - -db ~/databases/UNIPROT/blast/trembl/trembl -outfmt "7 sacc stitle evalue pident sstart send" -max_target_seqs 20 -qcov_hsp_perc 80 | grep -v "#"'`
            trembl, null = parse_blast(blast,'trembl')
            if trembl.length > 0
              if @choice[ch].nil?
                @choice[ch] = []
              end
              @choice[ch] = ( (@choice[ch]+trembl).sort_by{ |k| -k['cov'].to_f } ).first(20)
            end
          end
          #store_result
          if @choice[ch]!=nil && @choice[ch].length>0
            do_not_repeat[seq] = @choice[ch]
          end
        end
      end
      @viewerType = "ngl"
    end
    render :layout => 'main', :template => 'main/upload'
  end

  def parse_blast(blast,db)
    out = []
    rows = blast.split("\n")
    flag = false
    rows.each do |r|
      c = r.split("\t")
      title = parse_title(c[1])
      out.push({ 'acc'=>c[0], 'title'=>title, 'evalue'=>c[2], 'cov'=>c[3], 'start'=>c[4], 'end'=>c[5], 'db'=>db })
      if c[3].to_f  > 80 && !flag
        flag  = true
      end
    end
    return out, flag
  end

  def parse_title(title)
    tmp = title.split("=")
    out = {}
    long_name = tmp[0].chop.chop.chop
    short_name = long_name
    if long_name.length > 15
      short_name = long_name[0..11]+" ..."
    end
    out['name'] = {'short'=>short_name,'long'=>long_name}
    if tmp[0].include? " OS"
      long_org = tmp[1].chop.chop.chop
      short_org = long_org
      if short_org.length > 15
        short_org = long_org[0..11]+" ..."
      end
      out['org'] = {'short'=>short_org, 'long'=>long_org} 
    else
      out['org'] = "UNK"
    end
    if tmp[1].include? " GN"
      out['gene'] = tmp[2].chop.chop.chop
    else
      out['gene'] = "UNK"
    end
    return out
  end

  def recover(rand)
    recover_data = JSON.parse( File.read(LocalPath+"/"+rand+"/post_info.json") )
    return recover_data
  end

end
