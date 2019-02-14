module AnnotationPpiManager
  module SourceProteinData
    module SourceComplexFeature

      LocalPath = Settings.GS_LocalUpload

      include MappingsManager::FetchMappings
      include AlignmentsManager::BuildAlignments
      include ComputingTools::BiopythonInterfaceLib::BiopythonInterfaceTools
      include CollectorManager::CollectProteinData 
      include GlobalTools::FetchParserTools
      include ContingencyAnalysisManager::FetchContingencyAnalysis
      include SourceTools
      
      def sourceComplexFeature(pdbId, feature_call, config_, path=nil, job=nil)
        config = config_
        rri_key = :rri
        asa_key = :asa
        if path then
          pdbId.sub! "__", "."
          rri_key = 'rri'
          asa_key = 'asa'
        end
        contingency = nil
        if feature_call == "collectVariantDataFromUniprot" then
          job.update_info( "Processing Contingency" ) if(job)
          user_variants = nil
          if config.key? "annotations" then
            user_variants = get_variants(config['annotations'])
            contingency = process_contingency(pdbId,annotations=config['annotations'],file=path)
          else
            contingency = process_contingency(pdbId,annotations=nil,file=path)
          end
          job.update_info( "Processing Contingency END" ) if(job)
        end
        job.update_info( "runBiopythonInterface" ) if(job)
        asa_rri = runBiopythonInterface(pdbId, path)
        interface = {}
        asa_rri[rri_key][0].each do |chi,vi|
          vi.each do |chj,vj|
            vj.each do |vk|
              resi = vk[0]
              resj = vk[1]
              if not interface.key? chi then
                interface[chi]={}
              end
              if not interface[chi].key? resi then
                interface[chi][resi]={}
              end
              if not interface.key? chj then
                interface[chj]={}
              end
              if not interface[chj].key? resj then
                interface[chj][resj]={}
              end
              interface[chi][resi][chj]=true
              interface[chj][resj][chi]=true
            end
          end
        end
        job.update_info( "runBiopythonInterface END" ) if(job)
        buried = {}
        asa_rri[asa_key][0].each do |ch,v|
          buried[ch] = {}
          v.each do |j|
            if j[1] < 0.1 then
              buried[ch][j[0]] = 'buried'
            else
               buried[ch][j[0]] = 'surface'
            end
          end
        end

        custom_data = {}
        if feature_call == "custom_data" then
          if path.nil? then
            alignment = fetchPDBalignment(pdbId)[pdbId]
          else
            alignment = fetchPDBalignment(path)[pdbId]
          end
          annotations = JSON.parse(config['annotations'])
          unless annotations.kind_of? Array then
            annotations = [annotations]
          end
          annotations = check_annotations(annotations,alignment)
          annotations.each do |a|
            if a.key? "chain" then
              custom_data[a['chain']] = [] unless custom_data.key? a['chain']
              custom_data[a['chain']].concat a['data']
            elsif a.key? "acc" or a.key? "uniprot" then
              acc = nil
              if a.key? "acc" then 
                acc = a["acc"]
              elsif a.key? "uniprot" then
                acc = a["uniprot"]
              end
              custom_data[ acc ] = [] unless custom_data.key? acc
              custom_data[ acc ].concat a['data']
            end
          end
        end

        mapping = {}
        if path.nil? then
          mapping = fetchUniprotfromPDB(pdbId) 
        else
          mapping = JSON.parse( File.read(LocalPath+"/"+path+"/alignment.json") )[pdbId]
        end 
        features = {}
        location = {}
        _n_status = 0
        if job then
          mapping.each do |k,v|
            v.each do |ki,vi_|
              if path.nil? then
                vi = vi_
              else
                vi = [k]
              end
              vi.each do |ch|
                _n_status += 1
              end
            end
          end
          job.init_status(_n_status) if(job)
        end
        mapping.each do |k,v|
          #if path.nil? then k => pdbId else k => ch
          v.each do |ki,vi_|
            #if path.nil? then ki => acc ; vi_ => [ch_i] else ki => acc ; vi_ => {mapping=>[]}
            x = []
            unless feature_call == "custom_data" then
              x = send(feature_call, ki)
              if !user_variants.nil? and user_variants.key? ki then
                x.concat user_variants[ki] 
              end
            else
              if custom_data.key? ki then
                x = custom_data[ki]
              end
            end
            if path.nil? then
              vi = vi_
            else
              vi = [k]
            end
            vi.each do |ch|
              job.update_info( "Chain "+ch+" "+" UniProt "+ki ) if(job)
              if !user_variants.nil? and user_variants.key? ch then
                x.concat user_variants[ch] 
              end
              if feature_call == "custom_data" and custom_data.key? ch then
                x.concat custom_data[ch]
              end
              unless features.key? ch
                features[ch] = {'buried'=>{}, 'surface'=>{}, 'interface'=> {}}
                location[ch] = { 'all'=>[],'bs'=>{} }
              end
              x.each do |k|
                if k.key? config['type_key'] then
                  type = k[ config['type_key'] ].downcase
                else
                  next
                end
                if k.key? 'color' then
                  color = k['color']
                elsif config.key? 'colors' and not config['colors'].nil? and config['colors'].key? type then
                  color = config['colors'][type]
                elsif config['colors'].key? 'default' and not config['colors']['default'].nil? then
                  color = config['colors']['default']
                else
                  color = "%06x" % (rand * 0xffffff)
                  color = "#"+color.to_s
                  config['colors'][type] = color
                end

                interface_flag = nil
                surface_flag = nil

                if interface.key? ch then
                  interface[ch].each do |resi,vali|
                    if resi.to_i >= k['start'].to_i and resi.to_i <= k['end'].to_i then
                      if interface_flag.nil? then
                        interface_flag = {}
                      end
                      interface[ch][ resi ].each do |chj,valj|
                        interface_flag[ chj ] = true
                      end
                    end
                  end
                end

                if buried.key? ch then
                  buried[ch].each do |resi,vali|
                    if resi.to_i >= k['start'].to_i and resi.to_i <= k['end'].to_i then
                      if vali == 'surface' then
                        surface_flag = 'surface'
                        break
                      elsif vali == 'buried' then
                        surface_flag = 'buried'
                      end
                    end
                  end
                end

                if interface_flag then
                  interface_flag.each do |i,vi|
                    if not features[ch]['interface'].key? i then
                      features[ch]['interface'][i]={}
                    end
                    features[ch]['interface'][i][type] = color
                    location[ch]['all'].push( {start:k['start'].to_i, end:k['end'].to_i, type:type, color:color} )
                    unless location[ch]['bs'].key? i  then
                      location[ch]['bs'][i] = []
                    end
                    location[ch]['bs'][i].push( {start:k['start'].to_i, end:k['end'].to_i, type:type, color:color} )
                  end
                elsif surface_flag then
                  if not features[ch].key? surface_flag  then
                    features[ch][ surface_flag ] = {}
                  end
                  features[ch][ surface_flag ][type] = color
                  location[ch]['all'].push( {start:k['start'].to_i, end:k['end'].to_i, type:type, color:color} )
                else
                  if not features[ch].key? 'unknown' then
                    features[ch][ 'unknown' ] = {}
                  end
                  features[ch]['unknown'][type] = color
                  location[ch]['all'].push( {start:k['start'].to_i, end:k['end'].to_i, type:type, color:color} )
                end
              end
              job.update_status() if(job)
            end
          end
        end
        
        out = {'nodes'=>{},'edges'=>{}, 'enriched'=>{}}
        features.each do |ch,v|
          out['nodes'][ch] = []
          if v['surface'] then
            v['surface'].each do |subtype,w|
              flag = 0
              if !contingency.nil? and contingency[ch][:alt].key? subtype.upcase then
                flag = 1
                out['enriched'][subtype.upcase]=true
              end
             out['nodes'][ch].push({shape:'circle', subtype:subtype ,color:w, type:'surface', enriched:flag}) 
            end
          end
          if v['buried'] then
            v['buried'].each do |subtype,w|
              flag = 0
              if !contingency.nil? and contingency[ch][:alt].key? subtype.upcase then
                flag = 1
                out['enriched'][subtype.upcase]=true
              end
             out['nodes'][ch].push({shape:'circle', subtype:subtype, color:w, type:'core', enriched:flag})
            end
          end
          if v['unknown'] then
            v['unknown'].each do |subtype,w|
              flag = 0
              if !contingency.nil? and contingency[ch][:alt].key? subtype.upcase then
                flag = 1
                out['enriched'][subtype.upcase]=true
              end
            out['nodes'][ch].push({shape:'square', subtype:subtype, color:w, type:'unknown', enriched:flag})
            end
          end
          if v['interface'].keys.length > 0 then
            v['interface'].each do |chj,vj|
              vj.each do |subtype,vk|
                unless out['edges'].key? ch+chj then
                  out['edges'][ch+chj]=[]
                end
                flag = 0
                if !contingency.nil? and contingency[ch][:bs].key? subtype.upcase then
                  flag = 1
                  out['enriched'][subtype.upcase]=true
                end
                out['edges'][ch+chj].push({shape:'circle', subtype:subtype, color:vk, enriched: flag})
              end
            end
          end
        end

        return {graph:out,location:location}
      end

      def process_contingency(pdbId,annotations=nil,file=nil)
        out = {}
        params = {pdb:pdbId, annotations:annotations, type:"contingency"}
        if not file.nil? and params[:pdb] =~ /interactome3d/ then
          params[:file] = file
        elsif not file.nil? then
          params[:file] = params[:pdb]
          params[:pdb] = file
        end
        contingency = f_analyse_pdb(params)
        contingency[:analysis].each do |ch,v_ch|
          out[ch] = {bs:{}, alt:{}} unless out.key? ch
          v_ch.each do |ann,v_ann|
            v_ann.each do |dys,v_dys|
              if ann =~ /INTERFACE/ then
                out[ch][:bs][dys] = true
              else
                out[ch][:alt][dys] = true
              end
            end
          end
        end
        return out
      end

    end
  end
end
