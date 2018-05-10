namespace :manage_external_dbs do
  desc "Delete external DB tables"
  task delete_all: :environment do
    PdbDatum.delete_all
    BiopythonInterface.delete_all
    Dsysmapentry.delete_all
    Ebifeaturesentry.delete_all
    Elmdbentry.delete_all
    EnsemblDatum.delete_all
    InterproDatum.delete_all
    Mobientry.delete_all
    Molprobityentry.delete_all
    Pdbredoentry.delete_all
    Pfamentry.delete_all
    Smartentry.delete_all
    UniprotToEnsemblTranscript.delete_all
  end

end
