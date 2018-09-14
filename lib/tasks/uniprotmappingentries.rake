namespace :uniprotmappingentries do
  desc "Seeds UniProtMapping"

  LocalDB = Settings.GS_LocalDB
  LocalApp = Settings.GS_LocalApp
  LocalAppDB = Settings.GS_LocalAppDB

  task seed_uniprotmapping: :environment do
    puts( "Collecting data" )

    in_file = LocalDB+"/UNIPROT_MAPPING/idmapping_selected.tab.gz"
    out_file = LocalAppDB+"/mysql/uniprot_ensembl.tsv" 
    system("zcat #{in_file} | cut -f1,19,20  | awk '{if($3)print $0}' > #{out_file}")
    data = `bash #{LocalApp}/lib/tasks/uniprotmappingentries.awk #{in_file} #{out_file}`
    print "finished\n"
  end


  task seed_uniprot2genename: :environment do
    puts( "Collecting data" )

    in_file = LocalDB+"/UNIPROT_MAPPING/idmapping.dat.gz"
    out_file = LocalAppDB+"/mysql/genename_uniprot.tsv" 
    system("zgrep Gene_Name #{in_file} | awk '{print $1\"\t\"$3}' > #{out_file}")
    print "finished\n"
  end

end
