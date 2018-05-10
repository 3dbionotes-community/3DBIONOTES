class FramesPpiController < ApplicationController

  LocalPath = Settings.GS_LocalUpload

  include ProteinManager::FetchSequenceInfo 
  def ppiIFrame
    @reload = nil
    if params.key? 'pdb' then
      pdbId = params[:pdb]
      pdbId.sub! "__","."
      path = nil
      if params.key? 'path' then
        path = params[:path]
      end
      rri = nil
      if path.nil? then
        alignment = JSON.parse(PdbDatum.find_by(pdbId: pdbId).data)
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
                                borderColor:'#4db5ff', 
                                backgroundColor:'#fff',
                                shape:'ellipse',
                                width:50,
                                height:50
            }})
          end
          if not vi.nil?
            vi.each do |kj,vj|
              if not ( track.key? ki+kj or track.key? kj+ki)
                track[ki+kj] = true
                edges.push({data:{id: ki+kj, source: ki, target: kj, lineColor: '#80caff', type: 'protein',sourceAnnotations: [  ], targetAnnotations: [  ]}})
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
                                width:50,
                                height:50
            }})

            #nodes.push( {data: {id: ch, name: "chain "+ch, nodeAnnotations:[]}} )
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
                    width = 50
                    height = 25
                    name = id.to_s+" - "+name
                  elsif name == "RNA"
                    borderColor = "#FF8000"
                    backgroundColor = "#FFE5CC"
                    shape = "ellipse"
                    width = 50
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
                                      height:height
                  }})
                end
                edges.push({data:{id: ch+id.to_s, source: ch, target: id.to_s+ch_n, type: 'protein', lineColor: '#80caff', sourceAnnotations: [  ], targetAnnotations: [  ]}})
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
                                height:50
            }})
          end     
        end
      end
      elements = {nodes:nodes,edges:edges}
      @elements = elements.to_json
      if nodes.length == 0 then
        @elements = "null"
        @reload = true
      end
    else
      @elements = "null"
    end
  end

  def recover(rand)
    recover_data = JSON.parse( File.read(LocalPath+"/"+rand+"/rri.json") )
    recover_data_n = JSON.parse( File.read(LocalPath+"/"+rand+"/rri_n.json") )
    recover_data_asa = JSON.parse( File.read(LocalPath+"/"+rand+"/asa.json") )
    return recover_data, recover_data_n, recover_data_asa
  end

end
