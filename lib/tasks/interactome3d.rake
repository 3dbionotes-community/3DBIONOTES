namespace :interactome3d do
  desc "Seed Interactome3D"

  localDB = Settings.GS_LocalDB
  localAppDB = Settings.GS_LocalAppDB

  task seed_interactome3d: :environment do
    data = `cut -f1,4,8-10,14 #{localDB}/INTERACTOME3D/*.proteins.dat | grep -v UNIPROT_AC`
    file = File.open(localAppDB+"/mysql/interactome3d_proteins.tsv",'w')
    data = data.split(/\n/)
    data.each do |d|
      r = d.split(/\t+|\s+/)
      file.write("NULL\t"+r[0]+"\t"+r[1]+"\t"+r[5]+"\tNULL\tNULL\t"+r[3]+"\t"+r[4]+"\t"+r[2]+"\n")
    end
    file.close()
    data = `cut -f1,4,14 #{localDB}/INTERACTOME3D/*.interactions.dat | grep -v FILENAME`
    data = `cut -f1,2,5,22 #{localDB}/INTERACTOME3D/*.interactions.dat | grep -v FILENAME `
    file = File.open(localAppDB+"/mysql/interactome3d_interactions.tsv",'w')
    data = data.split(/\n/)
    data.each do |d|
      file.write("NULL\t"+d+"\n")
    end
    file.close()
    puts("finished")
  end

end
