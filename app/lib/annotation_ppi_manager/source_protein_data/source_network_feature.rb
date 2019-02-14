module AnnotationPpiManager
  module SourceProteinData
    module SourceNetworkFeature

      LocalPath = Settings.GS_LocalUpload

      include MappingsManager::FetchMappings
      include ComputingTools::BiopythonInterfaceLib::BiopythonInterfaceTools
      include CollectorManager::CollectProteinData 
      include ContingencyAnalysisManager::FetchContingencyAnalysis
      include SourceTools

      def sourceNetworkFeature(network, feature_call, config, job=nil, annotations=nil)
        features = {}
        graph = {nodes:{}, edges:{}, enriched:{}}
        location = {}
        job.init_status(network['nodes'].length+network['edges'].length) if(job)
        ann_variants = nil
        network['nodes'].each do |n|
          node = []
          tracker = {}
          acc = n['acc']
          location[acc]={'all'=>[], 'bs'=>{}} unless(location.key? acc)
          contingency = {}
          if feature_call != "custom" then
            if feature_call == "collectVariantDataFromUniprot" then
              contingency = process_node_contingency(acc, annotations=annotations ) #job=job
              ann_variants = get_variants(annotations) unless annotations.nil?
            end
            features[acc] = send(feature_call,acc)
            if !ann_variants.nil? and ann_variants.key? acc then
              features[acc].concat ann_variants[acc] 
            end
          else
            features[acc]=[]
            unless annotations.kind_of? Array then
              annotations = [annotations]
            end
            annotations = check_annotations(annotations)
            annotations.each do |a|
              if a['uniprot'] == acc or a['acc'] == acc then
                features[acc].concat a['data']
              end
            end
          end
          job.update_info("node "+acc+" processing "+features[acc].length.to_s+" features") if(job)
          alignment = Interactome3dDatum.find_by(pdbId:n['file'])
          biopython = BiopythonInteractome3d.find_by(pdbId:n['file'])
          unless alignment.nil? or biopython.nil? then
            asa = JSON.parse(biopython.asa)
            alignment = JSON.parse(alignment.data)
            alignment.each do |ch,v|
              v.each do |acc,w|
                features[acc].each do |ann|
                  next unless ann.key? config['type_key']
                  subtype = filterName(ann[ config['type_key'] ],feature_call)
                  tracker[subtype]={} unless(tracker.key? subtype)
                  type, shape = checkNodeType(ann, w['mapping'], asa[0][ch])
                  color = selectColor(config, subtype)
                  if annotations and ann.key? 'color' then
                    color = ann['color']
                  end
                  loc = {type:subtype, color:color, 'start':ann['start'], 'end':ann['end'], ch:ch}
                  flag = false
                  if !contingency.nil? and contingency.key? :alt and contingency[:alt].key? subtype.upcase then
                    flag = true
                    graph[:enriched][subtype.upcase]=true
                  end
                  ann = {shape:shape, subtype:subtype, type:type, color:color, 'start':ann['start'], 'end':ann['end'], ch:ch, enriched:flag}
                  location[acc]['all'].push(loc)
                  unless tracker[subtype].key? type then
                    node.push(ann)
                    tracker[subtype][type] = true
                  end
                end
              end
            end
          else
            features[acc].each do |ann|
              next unless ann.key? config['type_key']
              subtype = filterName(ann[ config['type_key'] ],feature_call)
              tracker[subtype]={} unless(tracker.key? subtype)
              type, shape = "unknown", "square"
              color = selectColor(config,subtype)
              loc = {type:subtype, color:color, 'start':ann['start'], 'end':ann['end'], ch:nil}
              flag = false
              if !contingency.nil? and contingency.key? :alt and contingency[:alt].key? subtype.upcase then
                flag = true
                graph[:enriched][subtype.upcase]=true
              end
              ann = {shape:shape, subtype:subtype, type:type, color:color, 'start':ann['start'], 'end':ann['end'], ch:nil, enriched:flag}
              location[acc]['all'].push(ann)
              unless tracker[subtype].key? type then
                node.push(ann)
                tracker[subtype][type] = true
              end
            end
          end
          graph[:nodes][acc] = node
          job.update_status() if(job)
        end 

        network['edges'].each do |e|
          unless e['file'].nil? then
            biopython = BiopythonInteractome3d.find_by( pdbId:e['file'] )
            unless biopython.nil? then
              contingency = nil
              if feature_call == "collectVariantDataFromUniprot" then
                contingency = process_edge_contingency(e['file'], annotations=annotations)
              end
              rri = format_rri(JSON.parse(biopython.rri)[0])
              edge = []
              tracker = {}
              job.update_info("edge "+e['accA']+":("+e['accB']+") processing "+features[e['accA']].length.to_s+" features") if(job)
              features[e['accA']].each do |ann|
                next unless ann.key? config['type_key']
                if checkEdge(ann,rri,"A") then
                  subtype = filterName(ann[ config['type_key'] ],feature_call)
                  tracker[subtype]={} unless(tracker.key? subtype)
                  type, shape = "interface", "circle"
                  color = selectColor(config,subtype)
                  if annotations and ann.key? 'color' then
                    color = ann['color']
                  end
                  loc = {type:subtype, color:color, 'start':ann['start'], 'end':ann['end'], ch:"A"}
                  flag = false
                  if !contingency.nil? and contingency['A'][:bs].key? subtype.upcase then
                    flag = true
                    graph[:enriched][subtype.upcase]=true
                  end
                  ann = {shape:shape, subtype:subtype, type:type, color:color, 'start':ann['start'], 'end':ann['end'], ch:"A", enriched:flag}
                  location[e['accA']]['bs'][e['accB']]=[] unless(location[e['accA']]['bs'].key? e['accB'])
                  location[e['accA']]['bs'][e['accB']].push(loc)
                  unless tracker[subtype].key? type then
                    edge.push(ann)
                    tracker[subtype][type] = true
                  end
                end
              end
              graph[:edges][e['accA']+e['accB']] = edge
              edge = []
              tracker = {}
              job.update_info("edge "+e['accB']+":("+e['accA']+") processing "+features[e['accB']].length.to_s+" features") if(job)
              features[e['accB']].each do |ann|
                next unless ann.key? config['type_key']
                if checkEdge(ann,rri,"B") then
                  subtype = filterName(ann[ config['type_key'] ],feature_call)
                  tracker[subtype]={} unless(tracker.key? subtype)
                  type, shape = "interface", "circle"
                  color = selectColor(config,subtype)
                  if annotations and ann.key? 'color' then
                    color = ann['color']
                  end
                  loc = {type:subtype, color:color, 'start':ann['start'], 'end':ann['end'], ch:"B"}
                  flag = false
                  if !contingency.nil? and contingency['B'][:bs].key? subtype.upcase then
                    flag = true
                    graph[:enriched][subtype.upcase]=true
                  end
                  ann = {shape:shape, subtype:subtype, type:type, color:color, 'start':ann['start'], 'end':ann['end'], ch:"B", enriched:flag}
                  location[e['accB']]['bs'][e['accA']]=[] unless(location[e['accB']]['bs'].key? e['accA'])
                  location[e['accB']]['bs'][e['accA']].push(loc)
                  unless tracker[subtype].key? type then
                    edge.push(ann)
                    tracker[subtype][type] = true
                  end
                end
              end
              graph[:edges][e['accB']+e['accA']] = edge
            end
          end
          job.update_status() if(job)
        end
        return {graph:graph, location:location}
      end

      def format_rri(rri_)
        rri = {'A'=>{}, 'B'=>{}}
        rri_.each do |chA, v|
          v.each do |chB,w|
            w.each do |n|
              rri[chA][n[0].to_i] = true
              rri[chB][n[1].to_i] = true
            end
          end
        end       
        return rri
      end

      def checkEdge(ann,rri,ch)
        (ann['start'].to_i .. ann['end'].to_i).each do |i|
          if rri[ch].key? i then
            return true
          end
        end
        return false
      end

      def checkNodeType(ann, map, asa)
        type = "unknown"
        shape = "square"
        aa_asa = {}
        asa.each do |x|
          aa_asa[x[0]]=x[1]
        end
        (ann['start'].to_i .. ann['end'].to_i).each do |i|
          if aa_asa.key? i and  aa_asa[i]>=0.1 then
            type = "surface"
            shape = "circle"
            break
          elsif aa_asa.key? i then
            type = "buried"
            shape = "circle"
          end
        end
        return type, shape
      end

      def selectColor(config, type_)
        type = type_.downcase
        if  config['colors'].key? type then
          color = config['colors'][type]
        elsif not config['colors']['default'].nil? then
          color = config['colors']['default']
        else
          color = "%06x" % (rand * 0xffffff)
          color = "#"+color.to_s
          config['colors'][type] = color
        end
        return color
      end

      def filterName(subtype,key)
        name = subtype
        if key=="collectVariantDataFromUniprot" and subtype=~/doi/i then
          x = name.split("/ ")
          y = x[1].split(" [")
          name = y[0]
        end
        return name
      end

      def process_node_contingency(acc, annotations=nil, job=nil)

        out = {bs:{}, alt:{}}
        unless annotations.nil? then
          annotations, user_variants = process_annotations(annotations)
        else
          annotations = []
        end
        user_var = []
        user_var = user_variants[acc] if not user_variants.nil? and user_variants.key? acc
        contingency, features = test_uniprot(acc, extra={bs:annotations,var:user_var}, type="contingency", job=job) 
        contingency.each do |ann,v_ann|
          v_ann.each do |dys,v_dys|
            out[:alt][dys] = true
          end
        end
        return out
      end

      def process_edge_contingency(file, annotations=nil)
        out = {}
        params = {pdb:"interactome3d", file:file ,annotations:annotations, type:"contingency"}
        contingency = f_analyse_pdb(params)
        contingency[:analysis].each do |ch,v_ch|
          out[ch] = {bs:{}, alt:{}} unless out.key? ch
          v_ch.each do |ann,v_ann|
            v_ann.each do |dys,v_dys|
              if ann =~ /INTERFACE/ then
                out[ch][:bs][dys] = true
              end
            end
          end
        end
        return out
      end

    end
  end
end
