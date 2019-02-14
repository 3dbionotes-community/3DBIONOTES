namespace :swissvarentries do
  desc "Seeds SwissVar"
  localDB = Settings.GS_LocalDB
  localAppDB = Settings.GS_LocalAppDB
  
  #AminoDic = {'CYS'=>'C', 'ASP'=>'D', 'SER'=>'S', 'GLN'=>'Q', 'LYS'=>'K','ILE'=>'I', 'PRO'=>'P', 'THR'=>'T', 'PHE'=>'F', 'ASN'=>'N', 'GLY'=>'G', 'HIS'=>'H', 'LEU'=>'L', 'ARG'=>'R', 'TRP'=>'W','ALA'=>'A', 'VAL'=>'V', 'GLU'=>'E', 'TYR'=>'Y', 'MET'=>'M'}

  task seed_swissvar: :environment do
    data = `awk -F"\t" '{if(length($3)>0 && length($6)>0)print $0}' #{localDB}/SWISSVAR/swissvar.tsv`   
    data = data.split(/\n/)
    file = File.open(localAppDB+"/mysql/swissvar.tsv",'w')
    out = {}
    data.each do |l|
      r = l.split("\t")
      res = r[5]
      res.slice!(0,2)
      original = AminoDic[res.slice!(0,3).upcase]
      variation = AminoDic[res.slice!(-3,3).upcase]
      acc = r[0]
      acc.gsub!(/\t+|\s+/,'')
      dis = r[2]
      var = r[4]
      x = {start:res.to_i, end:res.to_i, position:res.to_i, original:original, variation:variation, disease:dis, evidence:var}
      out[acc] = [] unless out.key? acc
      out[acc].push x
    end
    out.each do |k,v|
      file.write("NULL\t"+k+"\t"+v.to_json+"\n")
    end
    file.close()
  end


end
