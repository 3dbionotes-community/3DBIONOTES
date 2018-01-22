class AnnotationsController < ApplicationController

  include AnnotationManager::FetchProteinData
  include AnnotationManager::FetchGeneData
  include ProteinManager::FetchSequenceInfo

  def getBiomutaFromUniprot
    toReturn = fetchBiomutaFromUniprot(params[:name])
    return render json: toReturn, status: :ok
  end

  def getPhosphositeFromUniprot
    toReturn = fetchPhosphositeFromUniprot(params[:name])
    return render json: toReturn, status: :ok
  end

  def getDbptmFromUniprot 
    toReturn = fetchDbptmFromUniprot(params[:name])
    return render json: toReturn, status: :ok
  end

  def getIEDBfromUniprot
    uniprotAc = params[:name]
    info = fetchIEDBfromUniprot(uniprotAc)
    return render json: info, status: :ok
  end

  def getUniprotMultipleSequences
    uniprotAc = params[:name]
    seqs = fetchUniprotMultipleSequences(uniprotAc)
    return render json: seqs, status: :ok
  end

  def getDsysmapFromUniprot
    uniprotAc = params[:name]
    info = fetchDsysmapFromUniprot(uniprotAc)
    return render json: info, status: :ok
  end

  def getUniprotLength
    uniprotAc = params[:name]
    uniprot_seq = fetchUniprotSequence(uniprotAc)
    uniLength = uniprot_seq.seq.length
    return render json: uniLength, status: :ok
  end

  def getENSEMBLvariants
    ensembl_id = params[:name]
    out = fetchENSEMBLvariants(ensembl_id)
    return render json: out, status: :ok
  end

  def getENSEMBLannotations
    ensembl_id = params[:name]
    out = fetchENSEMBLannotations(ensembl_id)
    return render json: out, status: :ok
  end

  def getELMDBfromUniprot
    uniprotAc = params[:name]
    toReturn = fetchElmdbFromUniprot(uniprotAc)
    return render json: toReturn, status: :ok
  end

  def getPfamFromUniprot
    uniprotAc = params[:name]
    toReturn = fetchPfamFromUniprot(uniprotAc)
    return render json: toReturn, status: :ok
  end

  def getMobiFromUniprot
    uniprotAc = params[:name]
    toReturn = fetchMobiFromUniprot(uniprotAc)
    return render json: toReturn, status: :ok
  end

  def getSMARTfromUniprot
    uniprotAc = params[:name]
    toReturn = fetchSmartFromUniprot(uniprotAc)
    return render json: toReturn, status: :ok
  end

  def getInterproFromUniprot
    uniprotAc = params[:name]
    toReturn = fetchInterproFromUniprot(uniprotAc)
    return render json: toReturn, status: :ok
  end

  def getPDB_REDO
    pdbId = params[:name]
    toReturn = fetchPDB_REDO(pdbId)
    return render json: toReturn, status: :ok
  end

end
