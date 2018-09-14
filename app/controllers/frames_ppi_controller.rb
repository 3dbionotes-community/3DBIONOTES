class FramesPpiController < ApplicationController

  LocalPath = Settings.GS_LocalUpload

  skip_before_filter :verify_authenticity_token, :only => [:ppiIFrame]
  include ProteinManager::FetchSequenceInfo 
  include FramesPpiManager::FramesPpiTools

  def ppiIFrame
    @reload = nil
    if params.key? 'pdb' then
      pdbId = params[:pdb]
      pdbId.gsub! "__","."
      path = nil
      if params.key? 'path' then
        path = params[:path]
      end
      alignment_rri = getBiopythonData(pdbId,path) 
      nodes,edges = buildGraph(alignment_rri)
      elements = {nodes:nodes,edges:edges}
      @elements = elements.to_json
      if nodes.length == 0 then
        @elements = "null"
        @reload = true
      end
    elsif params.key? 'ppi_network' then
      ppi_network = JSON.parse(params[:ppi_network])
      @ppi_network = params[:ppi_network]
      nodes,edges = buildInteractome3dGraph(ppi_network)
      elements = {nodes:nodes,edges:edges}
      @elements = elements.to_json
    else
      @elements = "null"
    end
  end

end
