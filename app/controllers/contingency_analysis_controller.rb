class ContingencyAnalysisController < ApplicationController

  include CollectorManager::CollectProteinData
  include ProteinManager::FetchSequenceInfo
  include AlignmentsManager::BuildAlignments
  include ComputingTools::BiopythonInterfaceLib::BiopythonInterfaceTools
  include ContingencyAnalysisManager::FetchContingencyAnalysis

  require 'rubystats'

  skip_before_action :verify_authenticity_token, :only => [:analyse_uniprot,:analyse_pdb]

  def analyse_uniprot
    acc = params[:acc]
    annotations = params[:annotations]
    unless annotations.nil? then
      annotations = JSON.parse(annotations)
      annotations, user_variants = process_annotations(annotations)
    else
      annotations = []
    end
    user_var = []
    user_var = user_variants[acc] if not user_variants.nil? and user_variants.key? acc
    contingency_table, features = test_uniprot(acc,extra={bs:annotations,var:user_var},type=request.original_url)
    return render json: {analysis:contingency_table, features:features}, status: :ok
  end

  def analyse_pdb
    params[:type] = request.original_url
    out = f_analyse_pdb(params)
    return render json: out, status: :ok
  end

end
