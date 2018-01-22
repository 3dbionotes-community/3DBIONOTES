class FramesPpiController < ApplicationController

  LocalPath = Settings.GS_LocalUpload

  include ProteinManager::FetchSequenceInfo 
  def ppiIFrame
    pdbId = params[:pdb]
    pdbId.sub! "__","."
    path = params[:path]
    rri = nil
    alignment = JSON.parse(PdbDatum.find_by(pdbId: pdbId).data)
    uniprot = {}
    alignment.each do |k,v|
      uniprot[ v.keys[0] ] = true
    end
    uniprot = fetchUniprotMultipleSequences(uniprot.keys.join(","))
    if path.nil?
      out = BiopythonInterface.find_by(pdbId: pdbId)
      if not out.nil?
        rri = JSON.parse(out.rri)[0]
      else
        rri= nil
      end
    else
      filename = LocalPath+"/"+path+"/rri.json"
      if File.exist?(filename)
        out = recover(path)
      else
        rri = nil
      end
    end
    nodes = []
    edges = []
    track = {}
    rri.each do |ki,vi|
      if not track.key? ki
        track[ki] = true
        gene_name = uniprot[ alignment[ki].keys[0] ][2]
        nodes.push({data: { id: ki, name: gene_name}})
      end
      if not vi.nil?
        vi.each do |kj,vj|
          if not ( track.key? ki+kj or track.key? kj+ki)
            track[ki+kj] = true
            edges.push({data:{id: ki+kj, source: ki, target: kj}})
          end
        end
      end
    end 
    elements = nodes + edges
    @elements = elements.to_json
  end

  def recover(rand)
    recover_data = JSON.parse( File.read(LocalPath+"/"+rand+"/rri.json") )
    return recover_data
  end

end
