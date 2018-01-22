namespace :uniprotmappingentries do
  desc "Seeds UniProtMapping"

  require_relative '../../app/lib/global_tools/global_sites'
  include GlobalTools::GlobalSites
  LocalDB = GS_LocalDB
  LocalApp = GS_LocalApp
  LocalAppDB = GS_LocalAppDB

  task seed_uniprotmapping: :environment do
    puts( "Collecting data" )

    in_file = LocalDB+"/UNIPROT_MAPPING/idmapping_selected.tab.gz"
    out_file = LocalAppDB+"/mysql/uniprot_ensembl.tsv" 
    system("zcat #{in_file} | cut -f1,19,20  | awk '{if($3)print $0}' > #{out_file}")
    data = `bash #{LocalApp}/lib/tasks/uniprotmappingentries.awk #{in_file} #{out_file}`
    print "finished\n"
  end

end
