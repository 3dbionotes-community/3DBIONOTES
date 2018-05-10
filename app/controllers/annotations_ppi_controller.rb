class AnnotationsPpiController < ApplicationController
  
  include AnnotationPpiManager::FetchProteinData

  def getComplexVariants
    pdbId = params[:name]
    path = params[:path]
    out = fetchComplexVariants(pdbId,path)
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

end
