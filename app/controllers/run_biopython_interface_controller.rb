class RunBiopythonInterfaceController < ApplicationController

  include ComputingTools::BiopythonInterfaceLib::BiopythonInterfaceTools

  def run
    pdbId = params[:name]
    path = params[:path]
    out = runBiopythonInterface(pdbId,path)
    return render json: out, status: :ok
  end

end
