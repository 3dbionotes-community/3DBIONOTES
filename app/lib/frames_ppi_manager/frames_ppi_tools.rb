module FramesPpiManager
  module FramesPpiTools

    LocalPath = Settings.GS_LocalUpload
    include ProteinManager::FetchSequenceInfo

    def getBiopythonData(pdbId, path=nil)
      rri = nil
      rri_n = nil
      asa = nil
      if path.nil? then
        alignment = JSON.parse(PdbDatum.find_by(pdbId: pdbId).data)
      elsif path == "interactome3d" then
        alignment = JSON.parse(Interactome3dDatum.find_by(pdbId: pdbId).data)
        alignment = alignment[pdbId]
      else
        alignment = JSON.parse( File.open(LocalPath+'/'+path+'/alignment.json').read )
        alignment = alignment[pdbId]
      end
      uniprot = {}
      alignment.each do |k,v|
        uniprot[ v.keys[0] ] = true
      end
      uniprot = fetchUniprotMultipleSequences(uniprot.keys.join(","))
      if path.nil?
        out = BiopythonInterface.find_by(pdbId: pdbId)
        if not out.nil?
          rri = JSON.parse(out.rri_raw)[0]
          rri_n = JSON.parse(out.rri_n)[0]
          asa = JSON.parse(out.asa)[0]
        else
          rri= nil
        end
      else
        filename = LocalPath+"/"+path+"/rri_raw.json"
        if File.exist?(filename)
          rri, rri_n, asa = recover(path)
          rri = rri[0]
          rri_n = rri_n[0]
          asa = asa[0]
        else
          rri = nil
        end
      end
      return {alignment:alignment, uniprot:uniprot,  rri:rri, rri_n:rri_n, asa:asa}
    end

    def buildGraph(alignment_rri)
      alignment=alignment_rri[:alignment]
      uniprot=alignment_rri[:uniprot]
      rri=alignment_rri[:rri]
      rri_n=alignment_rri[:rri_n]
      asa=alignment_rri[:asa]
      nodes = []
      edges = []
      track = {}
      if not rri.nil? then
        rri.each do |ki,vi|
          if not track.key? ki
            track[ki] = true
            if alignment.key? ki then
              gene_name = ki+" - "+uniprot[ alignment[ki].keys[0] ][2]
            else
              gene_name = "Chain "+ki
            end
            nodes.push({data:{  id: ki, 
                                name: gene_name, 
                                nodeAnnotations:[], 
                                borderColor: '#bbb',#'#4db5ff', 
                                backgroundColor:'#fff',
                                shape:'ellipse',
                                width:60,
                                height:60,
                                color:'#bbb'
            }})
          end
          if not vi.nil?
            vi.each do |kj,vj|
              if not ( track.key? ki+kj or track.key? kj+ki)
                track[ki+kj] = true
                edges.push({data:{id: ki+kj, source: ki, target: kj, lineColor: '#bbb', lineStyle:'solid', type: 'protein',sourceAnnotations: [  ], targetAnnotations: [  ]}})
              end
            end
          end
        end 
      end
      if not rri_n.nil? then
        rri_n.each do |ch,v|
          if not track.key? ch then
            if alignment.key? ch then
              gene_name = ch+" - "+uniprot[ alignment[ch].keys[0] ][2]
            else
              gene_name = "Chain "+ch
            end
            nodes.push({data:{  id: ch, 
                                name: gene_name, 
                                nodeAnnotations:[], 
                                borderColor:'#4db5ff', 
                                backgroundColor:'#fff',
                                shape:'ellipse',
                                width:60,
                                height:60,
                                color:'#bbb'
            }})
            track[ch] = true
          end
          v.each do |ch_n,vn|
            vn.each do |name,vm|
              vm.each do |id|
                if name == "HOH"
                  next
                end
                if not track.key? id.to_s+ch_n then
                  track[ ch_n ] = true
                  track[ id.to_s+ch_n ] = true
                  if name == "DNA"
                    borderColor = "#FF8000"
                    backgroundColor = "#FFE5CC"
                    shape = "ellipse"
                    width = 60
                    height = 25
                    name = id.to_s+" - "+name
                  elsif name == "RNA"
                    borderColor = "#FF8000"
                    backgroundColor = "#FFE5CC"
                    shape = "ellipse"
                    width = 60
                    height = 25
                    name = id.to_s+" - "+name
                  else
                    borderColor = "#009900"
                    backgroundColor = "#CCFFCC"
                    shape = "triangle"
                    width = 20 
                    height = 20
                  end
                  nodes.push({data:{  id: id.to_s+ch_n, 
                                      name: name, 
                                      borderColor:borderColor, 
                                      backgroundColor:backgroundColor,
                                      nodeAnnotations:[],
                                      shape:shape,
                                      width:width,
                                      height:height,
                                      color:'#bbb'
                  }})
                end
                edges.push({data:{id: ch+id.to_s, source: ch, target: id.to_s+ch_n, type: 'protein', lineColor: '#bbb', lineStyle:'solid', sourceAnnotations: [  ], targetAnnotations: [  ]}})
              end
            end
          end
        end
      end
      if not asa.nil? then
        asa.each do |ki,vi|
          if not track.key? ki
            track[ki] = true
            if alignment.key? ki then
              gene_name = ki+" - "+uniprot[ alignment[ki].keys[0] ][2]
            else
              gene_name = "Chain "+ki
            end
            nodes.push({data:{  id: ki, 
                                name: gene_name, 
                                nodeAnnotations:[], 
                                borderColor:'#4db5ff', 
                                backgroundColor:'#fff',
                                shape:'ellipse',
                                width:50,
                                height:50,
                                color:'#bbb'
            }})
          end     
        end
      end
      return nodes,edges
    end

    def buildInteractome3dGraph(ppi_network)
      _accs = []
      ppi_network['nodes'].each do |n|
        _accs.push(n['acc'])
      end
      uniprot = fetchUniprotMultipleSequences(_accs.join(","))
      nodes = []
      type2color = {'Structure'=>'#4db5ff','Model'=>'#ffcc00','Dom_dom_model'=>'#ffcc00'}
      type2style = {'Structure'=>'solid','Model'=>'solid','Dom_dom_model'=>'dashed'}
      test = {}
      ppi_network['nodes'].each do |n|
        borderColor = '#ccc'
        borderColor = type2color[n['type']] if type2color.key? n['type']
        test[n['type']]=true
        gene_name = uniprot[n['acc']][2]
        nodes.push({data:{  id: n['acc'], 
                            name: gene_name, 
                            file:n['file'], 
                            nodeAnnotations:[], 
                            borderColor:borderColor, 
                            backgroundColor:'#fff',
                            shape:'ellipse',
                            width:60,
                            height:60,
                            color:'#bbb'
        }})
      end
      edges = []
      ppi_network['edges'].each do |e|
        ki = e['accA']
        kj = e['accB']
        lineColor = '#ccc'
        lineStyle = 'solid'
        lineColor = type2color[e['type']] if type2color.key? e['type']
        lineStyle = type2style[e['type']] if type2style.key? e['type']
        edges.push({data:{id: ki+":"+kj, source: ki, file:e['file'], target: kj, lineColor: lineColor, lineStyle:lineStyle, type: 'protein',sourceAnnotations: [  ], targetAnnotations: [  ]}})
      end
      return nodes,edges    
    end

    def recover(rand)
      recover_data = JSON.parse( File.read(LocalPath+"/"+rand+"/rri.json") )
      recover_data_n = JSON.parse( File.read(LocalPath+"/"+rand+"/rri_n.json") )
      recover_data_asa = JSON.parse( File.read(LocalPath+"/"+rand+"/asa.json") )
      return recover_data, recover_data_n, recover_data_asa
    end

  end
end
