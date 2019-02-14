class AnnotationsPpiController < ApplicationController
  
  skip_before_filter :verify_authenticity_token, :only => [:getPOST,:getComplexCustomData,:getComplexVariants]

  include AnnotationPpiManager::FetchProteinData
  include AnnotationPpiManager::FetchNetworkData

  def getComplexVariants
    pdbId = params[:name]
    path = params[:path]
    annotations = params[:annotations]
    out = fetchComplexVariants(pdbId,path,annotations)
    return render json: out, status: :ok
  end

  def getComplexPTMs
    pdbId = params[:name]
    path = params[:path]
    out = fetchComplexPTMs(pdbId,path)
    return render json: out, status: :ok
  end

  def getComplexPfam
    pdbId = params[:name]
    path = params[:path]
    out = fetchComplexPfam(pdbId,path)
    return render json: out, status: :ok
  end

  def getComplexInterPro
    pdbId = params[:name]
    path = params[:path]
    out = fetchComplexInterPro(pdbId,path)
    return render json: out, status: :ok
  end

  def getComplexSmart
    pdbId = params[:name]
    path = params[:path]
    out = fetchComplexSmart(pdbId,path)
    return render json: out, status: :ok
  end

  def getComplexEpitopes
    pdbId = params[:name]
    path = params[:path]
    out = fetchComplexEpitopes(pdbId,path)
    return render json: out, status: :ok
  end

  def getComplexELM
    pdbId = params[:name]
    path = params[:path]
    out = fetchComplexELM(pdbId,path)
    return render json: out, status: :ok
  end

  def getComplexCustomData
    pdbId = params[:pdb]
    path = params[:path]
    annotations = params[:annotations]
    out = fetchComplexCustomData(pdbId,path,annotations)
    return render json: out, status: :ok
  end

  def getPOST
    name = params[:name]
    network = JSON.parse(params[:network])
    annotations=nil
    if params[:annotations] then
      annotations = JSON.parse(params[:annotations])
    end
    out = fetchNetworkFeature(network,name,annotations)
    return render json: out, status: :ok
  end

end
