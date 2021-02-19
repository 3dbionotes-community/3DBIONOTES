class MappingsController < ApplicationController

  include MappingsManager::FetchMappings
  
  def getPDBsFromEMDB
    emdbId = params[:name].upcase
    toReturn = fetchPDBfromEMDB( emdbId )
    return render json: toReturn, status: :ok
  end

  def getEMDBFromPDBs
    pdbId = params[:name]
    toReturn = fetchEmdbfromPDB( pdbId )
    return render json: toReturn, status: :ok
  end
  
  def getPDBFromUniprot
    uniprotAc = params[:name].upcase
    toReturn = fetchPDBfromUniprot( uniprotAc )
    return render json: toReturn, status: :ok
  end
  
  def getUniprotFromPDB
    pdbId = params[:name]
    toReturn = fetchUniprotfromPDB( pdbId )
    return render json: toReturn, status: :ok
  end

  def getENSEMBLtranscriptFromUniprot
    acc = params[:name]
    toReturn = fetchENSEMBLtranscriptFromUniprot( acc )
    return render json: toReturn, status: :ok
  end

end
