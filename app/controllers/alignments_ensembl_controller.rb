class AlignmentsEnsemblController < ApplicationController

  include AlignmentsEnsemblManager::BuildAlignments
  def getENSEMBLalignment
    gene_id = params[:gene].upcase
    transcript_id = params[:transcript].upcase
    acc = params[:acc].upcase
    myStatus = :ok
    return render json: buildENSEMBLdataTranscriptViewer(gene_id,transcript_id,acc), status: myStatus
  end
  
end
