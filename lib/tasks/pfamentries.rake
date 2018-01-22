namespace :pfamentries do
  desc "Seeds Pfam"

  #require_relative '../../app/lib/global_tools/global_sites'
  #include GlobalTools::GlobalSites
  #LocalDB = GS_LocalDB

  task seed_pfam: :environment do
    puts('Reading files')
    puts(Settings.GS_LocalDB)
    puts(Settings.GS_LocalAppDB)
    #dom_loc = `zcat /home/joan/databases/PFAM_UNIPROT/Pfam-A.regions.uniprot.tsv.gz | tail --lines=+2 | cut -f1,5,6,7`
    #dom_loc = dom_loc.split(/\n/)

    #dom_name = `zcat /home/joan/databases/PFAM_UNIPROT/Pfam-A.clans.tsv.gz | cut -f1,4,5`
    #dom_name = dom_name.split(/\n/)

    #pfam_names = {}
    #dom_name.each do |l|
    #  line = l.chomp.split("\t")
    #  pfam_names[ line[0] ] = {'name'=>line[1], 'description'=>line[2]}
    #end

    #dom_loc.each do |l|
    #  line = l.chomp.split("\t")
    #  
    #end

  end

end
