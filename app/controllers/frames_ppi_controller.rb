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
        else
          rri= nil
        end
      else
        filename = LocalPath+"/"+path+"/rri_raw.json"
        if File.exist?(filename)
          rri = recover(path)
          rri = rri[0]
        else
          rri = nil
        end
      end
      if not rri.nil? then
        nodes = []
        edges = []
        track = {}
        rri.each do |ki,vi|
          if not track.key? ki
            track[ki] = true
            if alignment.key? ki then
              gene_name = ki+" - "+uniprot[ alignment[ki].keys[0] ][2]
            else
              gene_name = "Chain "+ki
            end
            nodes.push( {data: {id: ki, name: gene_name, nodeAnnotations:[]}} )
          end
          if not vi.nil?
            vi.each do |kj,vj|
              if not ( track.key? ki+kj or track.key? kj+ki)
                track[ki+kj] = true
                edges.push({data:{id: ki+kj, source: ki, target: kj, type: 'protein',sourceAnnotations: [  ], targetAnnotations: [  ]}})
              end
            end
          end
        end 
        elements = {nodes:nodes,edges:edges}
        @elements = elements.to_json
      else
        @elements = "null"
        @reload = true
      end
    else
      @elements = "null"
    end
  end

  def recover(rand)
    recover_data = JSON.parse( File.read(LocalPath+"/"+rand+"/rri.json") )
    return recover_data
  end

end
