namespace :uniprotmappingentries do
  desc "Seeds UniProtMapping"
  task seed_uniprotmapping: :environment do
    puts("Collecting data")
    data = `bash uniprotmappingentries.awk`
    print "finished\n"
  end

end
