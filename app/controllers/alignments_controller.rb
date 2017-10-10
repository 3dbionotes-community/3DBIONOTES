class AlignmentsController < ApplicationController

  include AlignmentsManager::BuildAlignments

  def getPDBalignment
    pdbId = params[:name]
    info = fetchPDBalignment(pdbId) 
    return render json: info, status: :ok
  end

  def getPDBcoverage
    pdbId_ch = params[:name]
    info = fetchPDBcoverage(pdbId_ch)
    return render json: info, status: :ok
  end

  def getPDBalignmentJSONP
    pdbId = params[:name]
    if pdbId == "undefined"
      toReturnInfo = ""
    else
      info = fetchPDBalignment(pdbId)
      toReturnInfo = "processAlignment("+info.to_json+")"
    end
    return render text: toReturnInfo, status: :ok
  end
  
end
