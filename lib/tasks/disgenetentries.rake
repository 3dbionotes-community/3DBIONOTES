namespace :disgenetentries do
  desc "Seed DisGeNet data"

  localDB = Settings.GS_LocalDB
  localAppDB = Settings.GS_LocalAppDB
  baseUrl = Settings.GS_BaseUrl

  #include '/services/bionotes/apps/bionotes/app/lib/'

  task seed_disgenet: :environment do
    trans2acc = {}
    File.open(localDB+"/UNIPROT_MAPPING/acc_ensemblt.tsv",'r').each do |l|
      r = l.split(/\t+|\s+/)
      trans2acc[ r[1] ] = r[0]
    end
    File.open(localDB+"/DISGENET/all_variant_disease_associations.tsv",'r').each do |l|
      begin
        r = l.split(/\t/)
        rs = r[0]
        disease = r[2]
        score = r[3]
        freq = r[4]
        url = Settings.GS_EnsemblServer+"/variation/human/"+rs+"?content-type=application/json"
        data = data = Net::HTTP.get_response(URI.parse(url)).body
        json = JSON.parse(data)
        if json.key? "error" then
          next
        end
        json["mappings"].each do |m|
          location = m['location']
          start = location.split(/\:/)[1].split(/\-/)[0].to_i
          url = Settings.GS_EnsemblServer+"/overlap/region/human/"+m['location']+"?content-type=application/json;feature=cds;"
          data = data = Net::HTTP.get_response(URI.parse(url)).body
          json = JSON.parse(data)
          trans_track = {}
          json.each do |t|
            if trans_track.key? t["Parent"] then
              next
            else
              trans_track[t["Parent"]] = true
            end
            if trans2acc.key? t["Parent"] then
              #puts "analyzinng "+t["Parent"]+"\t"+trans2acc[ t["Parent"] ]
              #puts "\t"+location
              uniprot_acc = trans2acc[ t["Parent"] ]
              url = baseUrl+"/api/mappings/Uniprot/ENSEMBL/transcript/"+uniprot_acc
              data = data = Net::HTTP.get_response(URI.parse(url)).body
              ensembl_mapping = JSON.parse(data)
              url = baseUrl+"/api/alignments/ENSEMBL/"+ensembl_mapping['gene']['id']+"/"+ensembl_mapping['transcript'][0]['id']+"/"+uniprot_acc
              data = data = Net::HTTP.get_response(URI.parse(url)).body
              alignment = json = JSON.parse(data)
              if alignment["gene"]['strand'] > 0 then
                position = start-alignment["gene"]['start']
              else
                position = alignment["gene"]['start']-start
              end
              position = position.to_s
              if alignment["transcript"]["alignment"]["g2p"].key? position then
                ensembl_position = alignment["transcript"]["alignment"]["g2p"][position].to_i
                uniprot_position = alignment["transcript"]["alignment"]["p2u"][ensembl_position]
                puts uniprot_acc+"\t"+uniprot_position.to_s+"\t"+disease+"\t"+score+"\t"+freq
              end
            else
              puts "ERROR!!!"
            end
          end
        end
      rescue StandardError => e  
        puts e.message
        puts e.backtrace.inspect
        puts "LINE ERROR "+l
      end
    end
  end

end
