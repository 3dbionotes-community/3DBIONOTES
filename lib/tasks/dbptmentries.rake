require 'json'

namespace :dbptmentries do
  desc "Seeds dbPTM"

  localDB = Settings.GS_LocalDB
  localAppDB = Settings.GS_LocalAppDB

  task seed_dbptm: :environment do
    puts("collecting data")
    data = `cut -f2,3,5,8 #{localDB}/DBPTM/dbPTM3.txt | sort | uniq | awk '{if($3!="-"){print $0}}'`
    data = data.split(/\n/)
    ptm = {}

    data.each do |l|
      line = l.chomp.split("\t")
      uniprotAc = line[0].strip
      position = line[1].strip
      pubmed = line[2].strip
      type = line[3].strip
      ptm[uniprotAc] ||= []
      ptm[uniprotAc].push( {'start'=>position, 'end'=>position, 'evidences'=>pubmed, 'type'=>type} )
    end
    puts("writing tsv file")
    file = File.open(localAppDB+"/mysql/dbptm.tsv",'w')

    ptm.each do |k,v|
      file.write("NULL\t"+k+"\t"+v.to_json+"\n")
    end
    file.close()
    puts("finished")
  end

end
