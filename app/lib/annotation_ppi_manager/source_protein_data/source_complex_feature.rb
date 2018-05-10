module AnnotationPpiManager
  module SourceProteinData
    module SourceComplexFeature

      LocalPath = Settings.GS_LocalUpload

      include MappingsManager::FetchMappings
      include ComputingTools::BiopythonInterfaceLib::BiopythonInterfaceTools
      include CollectorManager::CollectProteinData 
      
      def sourceComplexFeature(pdbId, feature_call, config_, path=nil)
        config = config_
        rri_key = :rri
        asa_key = :asa
        if path then
          pdbId.sub! "__", "."
          rri_key = 'rri'
          asa_key = 'asa'
        end
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

        mapping = {}
        if path.nil? then
          mapping = fetchUniprotfromPDB(pdbId) 
        else
          mapping = JSON.parse( File.read(LocalPath+"/"+path+"/alignment.json") )[pdbId]
        end 
        features = {}
        location = {}
        mapping.each do |k,v|
          v.each do |ki,vi_|
            x = send(feature_call, ki)
            if path.nil? then
              vi = vi_
            else
              vi = [k]
            end
            vi.each do |ch|
              unless features.key? ch
                features[ch] = {'buried'=>{}, 'surface'=>{}, 'interface'=> {}}
                location[ch] = { 'all'=>[],'bs'=>{} }
              end
              x.each do |k|
                type = k[config['type_key']].downcase
                if  config['colors'].key? type then
                  color = config['colors'][type]
                elsif not config['colors']['default'].nil? then
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

            end
          end
        end

        out = {'nodes'=>{},'edges'=>{}}
        features.each do |ch,v|
          out['nodes'][ch] = []
          if v['surface'] then
            v['surface'].each do |subtype,w|
              out['nodes'][ch].push({shape:'circle', subtype:subtype ,color:w, type:'surface'}) 
            end
          end
          if v['buried'] then
            v['buried'].each do |subtype,w|
              out['nodes'][ch].push({shape:'circle', subtype:subtype, color:w, type:'core'})
            end
          end
          if v['unknown'] then
            v['unknown'].each do |subtype,w|
              out['nodes'][ch].push({shape:'square', subtype:subtype, color:w, type:'unknown'})
            end
          end
          if v['interface'].keys.length > 0 then
            v['interface'].each do |chj,vj|
              vj.each do |subtype,vk|
                unless out['edges'].key? ch+chj then
                  out['edges'][ch+chj]=[]
                end
                out['edges'][ch+chj].push({shape:'circle', subtype:subtype, color:vk})
              end
            end
          end
        end

        return {graph:out,location:location}
      end

    end
  end
end
