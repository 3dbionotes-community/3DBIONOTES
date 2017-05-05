namespace :interproentries do
  desc "Seeds InterPro"
  task seed_interpro: :environment do
    data = `cp /home/joan/databases/INTERPRO/interpro.tsv /home/joan/apps/bionotes/db/mysql/interpro.tsv`
  end

end
