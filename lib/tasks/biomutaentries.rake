require 'json'

namespace :biomutaentries do
  desc "Seeds BioMuta"

  localDB = Settings.GS_LocalDB
  localAppDB = Settings.GS_LocalAppDB

  task seed_biomuta: :environment do
    data = `awk -F","  '{if($10!=$11 && $12!="-" && $12~/damaging/ && $13!="-" && $14!="-")print $2","$9","$10","$11","$12","$13","$14","$15}' #{localDB}/BIOMUTA/BioMuta.csv | sort | uniq`
    data = data.split(/\n/)
    mutations = { 'XXX' => {} }
    puts "Biomuta processing data"
    __uniprotAc = 'XXX'
    n = data.length.to_i
    nn = data.length.to_i
    file = File.open(localAppDB+"/mysql/biomuta.tsv",'w')
    data.each do |l|
      tmp = {}
      linea = l.chomp.split(",")
      uniprotAc = linea[0].strip
      position = linea[1].strip
      original = linea[2].strip
      variation = linea[3].strip
      polyphen = linea[4].strip
      pubmed = linea[5].strip
      disease = linea[6].strip
      source = linea[7].strip
      tmp["start"] = position.to_i
      tmp["end"] = position.to_i
      tmp["position"] = position.to_i
      tmp["original"] = original
      tmp["variation"] = variation
      tmp["polyphen"] = polyphen
      tmp["evidence"] = [{"references"=>["PubMed:"+pubmed]}]
      tmp["disease"] = disease
      tmp["source"] = source
      tmp["type"] = "Pathology and Biotech"
      if uniprotAc != __uniprotAc
        mutations[ __uniprotAc ].each do |k,v|
          file.write("NULL\t"+__uniprotAc+"\t"+v.to_json+"\tNULL\tNULL\t"+k+"\n")
        end
        mutations = {}
        mutations[ uniprotAc ] = {}
        mutations[ uniprotAc ][position] = [ tmp ]
      else
        mutations[ uniprotAc ] ||= {}
        mutations[ uniprotAc ][position] ||= []
        mutations[ uniprotAc ][position].push(tmp)
      end
      n = n-1
      __uniprotAc = uniprotAc
      x = n.to_f/nn.to_f*100
      x = x.round(3)
      print x.to_s+"%  \r"
    end
    file.close()
  end

end
