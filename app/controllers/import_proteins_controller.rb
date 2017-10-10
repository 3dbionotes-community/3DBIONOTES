class ImportProteinsController < ApplicationController

  include ProteinManager::FetchSequenceInfo
  include ProteinManager::BlastSearch
  include ImportProteinsManager::ImportProteinsTools

  def import
    uniprotAc = params[:name]
    sequence = fetchUniprotSequence(uniprotAc)
    targets = runBlast(sequence.seq, name=uniprotAc)
    targets = get_annotations_number( targets )
    return render json: targets, status: :ok
  end

end
