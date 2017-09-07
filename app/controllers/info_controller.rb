class InfoController < ApplicationController

  include InfoManager::FetchEmdbInfo
  include InfoManager::FetchPdbInfo
  include InfoManager::FetchUniprotInfo

  def getEMDBsize
    emdbId = params[:name].upcase
    toReturn = fetchEMDBsize( emdbId )
    return render json: toReturn, status: :ok
  end

  def getEMDBtitle
    emdbId = params[:name].upcase
    toReturn = fetchEMDBtitle( emdbId )
    return render json: toReturn, status: :ok
  end

  def getEMDBinfo
    emdbId = params[:name].upcase
    toReturn = fetchEMDBthr( emdbId )
    myStatus = :ok
    if toReturn == {}
      myStatus = :not_found
    end
    return render json: toReturn, status: myStatus
  end

  def isEMDBavailable
    emdbId = params[:name].upcase
    toReturn = fetchEMDBavailty( emdbId )
    myStatus = :ok
    if toReturn == {}
      myStatus = :not_found
    end
    headers['Access-Control-Allow-Origin'] = '*'
    return render json: toReturn, status: myStatus
  end

  def isEMDBavailable_jsonp
    emdbId = params[:name].upcase
    toReturn = fetchEMDBavailty( emdbId )
    myStatus = :ok
    if toReturn == {}
      myStatus = :not_found
    end
    callback_name = "isEMDBavailable"
    if params.key?('callback') and ! params['callback'].nil? and params['callback'].length>0
      callback_name = params['callback']
    end
    jsonp = callback_name+'('+toReturn.to_json+')'
    return render text: jsonp, status: myStatus
  end

  def isPDBavailable
    pdb = params[:name].upcase
    toReturn = fetchPDBavailty( pdb )
    myStatus = :ok
    if toReturn == {}
      myStatus = :not_found
    end
    return render json: toReturn, status: myStatus
  end

  def getPDBtitle
    pdb = params[:name].upcase
    toReturn = fetchPDBtitle( pdb )
    myStatus = :ok
    return render json: toReturn, status: myStatus
  end

  def displayUniprotSequence
    uniprotAc = params[:name]
    toReturn = fetchUNIPROTsequence( uniprotAc )
    myStatus = :ok
    return render text: toReturn, status: myStatus
  end

  def getUniprotTitle
    uniprotAc = params[:name]
    toReturn = fetchUNIPROTtitle( uniprotAc )
    myStatus = :ok
    return render json: toReturn, status: myStatus
  end

end
