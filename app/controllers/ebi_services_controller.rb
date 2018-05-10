class EbiServicesController < ApplicationController
  
  include EbiServicesManager::EbiServicesFeatures
  def getEBIfeatures
    type = params[:type]
    uniprotAc = params[:name]
    toReturn = getFeaturesFromEBI( uniprotAc, type )
    jsonData = toReturn
    if jsonData.key? 'errorMessage'
      myStatus = :not_found
    else
      myStatus = :ok
    end
    return render json: toReturn, status: myStatus
  end

end
