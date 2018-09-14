module AnnotationPpiManager
  module SourceProteinData
    module SourceNetworkFeature

      LocalPath = Settings.GS_LocalUpload

      include MappingsManager::FetchMappings
      include ComputingTools::BiopythonInterfaceLib::BiopythonInterfaceTools
      include CollectorManager::CollectProteinData 
      
      def sourceNetworkFeature(network, feature_call, config, job=nil, annotations=nil)
        features = {}
        graph = {nodes:{}, edges:{}}
        location = {}
        job.init_status(network['nodes'].length+network['edges'].length) if(job)
        network['nodes'].each do |n|
          node = []
          tracker = {}
          acc = n['acc']
          location[acc]={'all'=>[], 'bs'=>{}} unless(location.key? acc)
          unless annotations then
            features[acc] = send(feature_call,acc)
            job.update_info("node "+acc+" processing "+features[acc].length.to_s+" features") if(job)
          else
            features[acc]=[]
            unless annotations.kind_of? Array then
              annotations = [annotations]
            end
            annotations.each do |a|
              if a['uniprot'] == acc or a['acc'] == acc then
                features[acc] = a['data']
              end
            end
          end
          alignment = Interactome3dDatum.find_by(pdbId:n['file'])
          biopython = BiopythonInteractome3d.find_by(pdbId:n['file'])
          unless alignment.nil? or biopython.nil? then
            asa = JSON.parse(biopython.asa)
            alignment = JSON.parse(Interactome3dDatum.find_by(pdbId:n['file']).data)
            alignment.each do |ch,v|
              v.each do |acc,w|
                features[acc].each do |ann|
                  subtype = filterName(ann[ config['type_key'] ],feature_call)
                  tracker[subtype]={} unless(tracker.key? subtype)
                  type, shape = checkNodeType(ann, w['mapping'], asa[0][ch])
                  color = selectColor(config, subtype)
                  if annotations and ann.key? 'color' then
                    color = ann['color']
                  end
                  loc = {type:subtype, color:color, 'start':ann['start'], 'end':ann['end'], ch:ch}
                  ann = {shape:shape, subtype:subtype, type:type, color:color, 'start':ann['start'], 'end':ann['end'], ch:ch}
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
              subtype = filterName(ann[ config['type_key'] ],feature_call)
              tracker[subtype]={} unless(tracker.key? subtype)
              type, shape = "unknown", "square"
              color = selectColor(config,subtype)
              loc = {type:subtype, color:color, 'start':ann['start'], 'end':ann['end'], ch:nil}
              ann = {shape:shape, subtype:subtype, type:type, color:color, 'start':ann['start'], 'end':ann['end'], ch:nil}
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
              rri = format_rri(JSON.parse(biopython.rri)[0])
              edge = []
              tracker = {}
              job.update_info("edge "+e['accA']+":("+e['accB']+") processing "+features[e['accA']].length.to_s+" features") if(job)
              features[e['accA']].each do |ann|
                if checkEdge(ann,rri,"A") then
                  subtype = filterName(ann[ config['type_key'] ],feature_call)
                  tracker[subtype]={} unless(tracker.key? subtype)
                  type, shape = "interface", "circle"
                  color = selectColor(config,subtype)
                  if annotations and ann.key? 'color' then
                    color = ann['color']
                  end
                  loc = {type:subtype, color:color, 'start':ann['start'], 'end':ann['end'], ch:"A"}
                  ann = {shape:shape, subtype:subtype, type:type, color:color, 'start':ann['start'], 'end':ann['end'], ch:"A"}
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
                if checkEdge(ann,rri,"B") then
                  subtype = filterName(ann[ config['type_key'] ],feature_call)
                  tracker[subtype]={} unless(tracker.key? subtype)
                  type, shape = "interface", "circle"
                  color = selectColor(config,subtype)
                  if annotations and ann.key? 'color' then
                    color = ann['color']
                  end
                  loc = {type:subtype, color:color, 'start':ann['start'], 'end':ann['end'], ch:"B"}
                  ann = {shape:shape, subtype:subtype, type:type, color:color, 'start':ann['start'], 'end':ann['end'], ch:"B"}
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

    end
  end
end
