namespace :uniprotmappingentries do
  desc "Seeds UniProtMapping"
  task seed_uniprotmapping: :environment do
    puts( "Collecting data" )
    data = `bash /home/joan/apps/bionotes/lib/tasks/uniprotmappingentries.awk`
    print "finished\n"
  end

end
