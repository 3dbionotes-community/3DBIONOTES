namespace :interproentries do
  desc "Seeds InterPro"

  localDB = Settings.GS_LocalDB
  localAppDB = Settings.GS_LocalAppDB

  task seed_interpro: :environment do
    system("perl #{localDB}/INTERPRO/parse_interpro_xml.pl #{localDB}/INTERPRO/")
    data = `cp #{localDB}/INTERPRO/interpro.tsv #{localAppDB}/mysql/interpro.tsv`
  end

end
