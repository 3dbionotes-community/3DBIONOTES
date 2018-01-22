require 'net/http'
require 'json'

localDB = Settings.GS_LocalDB
localAppDB = Settings.GS_LocalAppDB

PTMURLs = {}
PTMURLs["Acetylation"] = "#{localDB}/PHOSPHOSITE/acetylation_site_dataset.gz"
PTMURLs["Methylation"] = "#{localDB}/PHOSPHOSITE/methylation_site_dataset.gz"
PTMURLs["Phosphorylation"] = "#{localDB}/PHOSPHOSITE/phosphorylation_site_dataset.gz"
PTMURLs["Sumoylation"] = "#{localDB}/PHOSPHOSITE/sumoylation_site_dataset.gz"
PTMURLs["Ubiquitination"] = "#{localDB}/PHOSPHOSITE/ubiquitination_site_dataset.gz"
PTMURLs["OGalNAc"] = "#{localDB}/PHOSPHOSITE/O-GalNAc_site_dataset.gz"
PTMURLs["OGlcNAc"] = "#{localDB}/PHOSPHOSITE/O-GlcNAc_site_dataset.gz"

Disease = "#{localDB}/PHOSPHOSITE/disease-associated_sites.gz"
Regulatory = "#{localDB}/PHOSPHOSITE/regulatory_sites.gz"
KinasesURL = "#{localDB}/PHOSPHOSITE/kinase_Substrate_Dataset.gz"

def __downloadURL(url)
	begin
		gzData = Net::HTTP.get_response(URI.parse(url)).body
		data = Zlib::GzipReader.new(StringIO.new(gzData)).read
		validData = data.encode('utf-8', 'binary', :invalid => :replace, :undef => :replace)
	rescue Errno::ECONNREFUSED
		puts "Error en downloadURL, reintentando..."
		retry
	rescue
		puts "Error: #{$!}"
	end
	return validData
end

def downloadURL(url)
	begin
		data = Zlib::GzipReader.open(url).read
		validData = data.encode('utf-8', 'binary', :invalid => :replace, :undef => :replace)
	rescue Errno::ECONNREFUSED
		puts "Error en downloadURL, reintentando..."
		retry
	rescue
		puts "Error: #{$!}"
	end
	return validData
end


def parse_acc( acc )
  uniprot = acc
  if uniprot =~ /(\w{6})(\-)(\d+)/
    x = uniprot.split("-")
    if x[1] == "1"
      uniprot = x[0]
    end
  end
  if uniprot.length != 6
    if acc !~ /(\w{6})(\-)(\d+)/
      puts( uniprot )
    end
    uniprot = "NULL"
  end 
  return uniprot
end

def processPTMFile(stringData,eltipo)
	ptms = {}
	usefulData = stringData.split(/\r?\n|\r/)[4..-1].uniq
	usefulData.each do |line|
                begin
		  processedLine = line.chomp.split("\t")
		  if !(processedLine[2]=~/^NP_|^XP_|^ENS/)
		  	if processedLine[2]=~/_VAR_/
		  		uniprot = processedLine[2].split("_")[0]
		  	else
		  		uniprot = processedLine[2]
		  	end
                        uniprot = parse_acc(uniprot)
                        if uniprot == "NULL"
                          next
                        end
		  	if ptms[uniprot].nil?
		  		ptms[uniprot] = {}
		  	end
		  	#protId= getProteinId(processedLine[1])
                        protId = ""
		  	modification = processedLine[4]
		  	siteGroupId = processedLine[5]
		  	domain = processedLine[8]
		  	if ptms[uniprot][modification].nil?
		  		ptms[uniprot][modification] = {}
		  	  ptms[uniprot][modification]["siteGroupId"] = [[siteGroupId,protId]]
		  	  ptms[uniprot][modification]["domain"] = [domain]
		  	else
		  		ptms[uniprot][modification]["siteGroupId"].push([siteGroupId,protId])
		  		ptms[uniprot][modification]["siteGroupId"].uniq!
		  		ptms[uniprot][modification]["domain"].push(domain)
		  		ptms[uniprot][modification]["domain"].uniq!
		  	end
		  end
                rescue Exception => e
                  puts( e.message )
                end
	end
	dataReturn = {}
	ptms.each do |k,v|
          begin
		if dataReturn[k].nil?
			dataReturn[k]=[]
		end
                v.each do |k2,v2|
			tmpHash = {}
			tmpHash["position"] = (k2.split("-")[0][1..-1]).to_i
			tmpHash["start"] = (k2.split("-")[0][1..-1]).to_i
			tmpHash["end"] = (k2.split("-")[0][1..-1]).to_i
			tmpHash["type"]="Ptm/processing"
			tmpHash["subtype"]=eltipo
			tmpHash["description"] = ";;Domains: #{v2["domain"].join(", ")}"
                        tmpHash["description"].gsub! "\"",""
			tmpHash["link"] = v2["siteGroupId"]
		  dataReturn[k].push(tmpHash)
		end
          rescue Exception => e
            puts( e.message )
          end
	end
	return dataReturn
end

def processDiseaseFile( stringData )
	diseases = {}
	usefulData = stringData.split(/\r?\n|\r/)[4..-1].uniq
	usefulData.each do |line|
                begin
		  processedLine = line.chomp.split("\t")
		  if !(processedLine[4]=~/^NP_|^XP_|^ENS/)
		  	if processedLine[4]=~/_VAR_/
		  		uniprot = processedLine[4].split("_")[0]
		  	else
		  		uniprot = processedLine[4]
		  	end
                        uniprot = parse_acc(uniprot)
                        if uniprot == "NULL"
                          next
                        end
		  	if diseases[uniprot].nil?
		  		diseases[uniprot] = {}
		  	end
		  	#protId= getProteinId(processedLine[3])
		  	protId=""
		  	disName = processedLine[0].split(";").map{|e| e.strip}
		  	alteration = processedLine[1]
		  	siteGroupId = processedLine[9]
		  	modification= processedLine[10]
		  	notes = processedLine[18]
		  	if diseases[uniprot][modification].nil?
		  		diseases[uniprot][modification] = {}
		  	  diseases[uniprot][modification]["disease"] = disName
		  	  diseases[uniprot][modification]["siteGroupId"] = [[siteGroupId,protId]]
		  	  diseases[uniprot][modification]["notes"] = [notes]
		  	  diseases[uniprot][modification]["alteration"] = [alteration]
		  	else
		  		diseases[uniprot][modification]["disease"] += disName
		  		diseases[uniprot][modification]["disease"].uniq!
		  		diseases[uniprot][modification]["siteGroupId"].push([siteGroupId,protId])
		  		diseases[uniprot][modification]["siteGroupId"].uniq!
		  		diseases[uniprot][modification]["notes"].push(notes)
		  		diseases[uniprot][modification]["notes"].uniq!
		  		diseases[uniprot][modification]["alteration"].push(alteration)
		  		diseases[uniprot][modification]["alteration"].uniq!
		  	end
		  end
                rescue Exception => e
                  puts( e.message )
                end
	end
	dataReturn = {}
	diseases.each do |k,v|
          begin
		if dataReturn[k].nil?
			dataReturn[k]=[]
		end
		v.each do |k2,v2|
			if k2
				tmpHash = {}
				tmpHash["position"] = (k2.split("-")[0][1..-1]).to_i
				tmpHash["start"] = (k2.split("-")[0][1..-1]).to_i
				tmpHash["end"] = (k2.split("-")[0][1..-1]).to_i
				tmpHash["type"]="Ptm/processing"
				tmpHash["subtype"]="Diseases-associated site"
				tmpHash["description"] = ";;Disease: #{v2["disease"].join(". ")};;Alteration: #{v2["alteration"].join(", ")};;Notes: #{v2["notes"].join(", ")}"
                                tmpHash["description"].gsub! "\"",""
				tmpHash["link"] = v2["siteGroupId"]
				dataReturn[k].push(tmpHash)
			end
		end
          rescue Exception => e
            puts( e.message )
          end
	end
	return dataReturn
end

def processRegulatoryFile(stringData)
	regulatory = {}
	usefulData = stringData.split(/\r?\n|\r/)[4..-1].uniq
	usefulData.each do |line|
          begin
		  processedLine = line.chomp.split("\t")
		  if !(processedLine[3]=~/^NP_|^XP_|^ENS/)
		  	if processedLine[3]=~/_VAR_/
		  		uniprot = processedLine[3].split("_")[0]
		  	else
		  		uniprot = processedLine[3]
		  	end
                        uniprot = parse_acc(uniprot)
                        if uniprot == "NULL"
                          next
                        end
		  	if regulatory[uniprot].nil?
		  		regulatory[uniprot] = {}
		  	end
		  	#protId= getProteinId(processedLine[2])
		  	protId= ""
		  	siteGroupId = processedLine[8]
		  	modification = processedLine[7]
		  	functions = processedLine[11].split(";").map{|e| e.strip}
		  	processes = processedLine[12].split(";").map{|e| e.strip}
		  	protInteractions = processedLine[13].split(";").map{|e| e.strip}
		  	otherInteractions = processedLine[14].split(";").map{|e| e.strip}
		  	evidences = processedLine[15].split(";").map{|e| e.strip}
		  	notes = processedLine[19]
		  	if regulatory[uniprot][modification].nil?
		  		regulatory[uniprot][modification] = {}
		  		regulatory[uniprot][modification]["siteGroupId"] = [[siteGroupId,protId]]
		  		regulatory[uniprot][modification]["functions"]=functions
		  		regulatory[uniprot][modification]["processes"]=processes
		  		regulatory[uniprot][modification]["protInteractions"]=protInteractions
		  		regulatory[uniprot][modification]["otherInteractions"]=otherInteractions
		  		regulatory[uniprot][modification]["evidences"]=evidences
		  		regulatory[uniprot][modification]["notes"]=[notes]
		  	else
		  		regulatory[uniprot][modification]["siteGroupId"].push([siteGroupId,protId])
		  		regulatory[uniprot][modification]["siteGroupId"].uniq!
		  		regulatory[uniprot][modification]["functions"]+=functions
		  		regulatory[uniprot][modification]["functions"].uniq!
		  		regulatory[uniprot][modification]["processes"]+=processes
		  		regulatory[uniprot][modification]["processes"].uniq!
		  		regulatory[uniprot][modification]["protInteractions"]+=protInteractions
		  		regulatory[uniprot][modification]["protInteractions"].uniq
		  		regulatory[uniprot][modification]["otherInteractions"]+=otherInteractions
		  		regulatory[uniprot][modification]["otherInteractions"].uniq!
		  		regulatory[uniprot][modification]["evidences"]+=evicences
		  		regulatory[uniprot][modification]["evidences"].uniq!
		  		regulatory[uniprot][modification]["notes"].push(notes)
		  		regulatory[uniprot][modification].uniq!
		  	end
		  end
          rescue Exception => e
            puts( e.message )
          end
	end
	dataReturn = {}
	regulatory.each do |k,v|
          begin
		if dataReturn[k].nil?
			dataReturn[k]=[]
		end
		v.each do |k2,v2|
			tmpHash = {}
			tmpHash["position"] = (k2.split("-")[0][1..-1]).to_i
			tmpHash["start"] = (k2.split("-")[0][1..-1]).to_i
			tmpHash["end"] = (k2.split("-")[0][1..-1]).to_i
			tmpHash["type"]="Ptm/processing"
			tmpHash["subtype"]="Regulatory site"
			tmpHash["description"] = ";;Functions: #{v2["functions"].join(". ")};;Processes: #{v2["processes"].join(", ")};;Protein Interactions: #{v2["protInteractions"].join(", ")};;Other Interactions: #{v2["otherInteractions"].join(", ")}"
                        tmpHash["description"].gsub! "\"",""
			tmpHash["link"] = v2["siteGroupId"]
			tmpHash["evidence"]=v2["evidences"]
			dataReturn[k].push(tmpHash)
		end
          rescue Exception => e
            puts( e.message )
          end
	end
	return dataReturn
end

def processKinasesFile(stringData)
	kinases = {}
	usefulData = stringData.split(/\r?\n|\r/)[4..-1].uniq
	usefulData.each do |line|
          begin
		processedLine = line.chomp.split("\t")
		if !(processedLine[6]=~/^NP_|^XP_|^ENS/)
			if processedLine[6]=~/_VAR_/
				uniprot = processedLine[6].split("_")[0]
			else
				uniprot = processedLine[6]
			end
                        uniprot = parse_acc(uniprot)
                        if uniprot == "NULL"
                          next
                        end
			if kinases[uniprot].nil?
				kinases[uniprot] = {}
			end
			#protId= getProteinId(processedLine[6])
			protId= ""
			kinaseId = processedLine[1]
			modification = processedLine[9]
			siteGroupId = processedLine[10]
			domain = processedLine[12]
			if kinases[uniprot][modification].nil?
				kinases[uniprot][modification] = {}
				kinases[uniprot][modification]["kinase"]=[kinaseId]
				kinases[uniprot][modification]["siteGroupId"]=[[siteGroupId,protId]]
				kinases[uniprot][modification]["domain"]=[domain]
			else
				kinases[uniprot][modification]["kinase"].push(kinaseId)
				kinases[uniprot][modification]["kinase"].uniq!
				kinases[uniprot][modification]["siteGroupId"].push([siteGroupId,protId])
				kinases[uniprot][modification]["siteGroupId"].uniq!
				kinases[uniprot][modification]["domain"].push(domain)
				kinases[uniprot][modification]["domain"].uniq!
			end
		end
          rescue Exception => e
            puts( e.message )
          end
	end
	dataReturn = {}
	kinases.each do |k,v|
          begin
		if dataReturn[k].nil?
			dataReturn[k]=[]
		end
		v.each do |k2,v2|
			tmpHash = {}
			tmpHash["position"] = (k2.split("-")[0][1..-1]).to_i
			tmpHash["start"] = (k2.split("-")[0][1..-1]).to_i
			tmpHash["end"] = (k2.split("-")[0][1..-1]).to_i
			tmpHash["type"]="Ptm/processing"
			tmpHash["subtype"]="Sustrate-Kinase interaction"
			tmpHash["description"] = ";;Kinases: #{v2["kinase"].join(", ")};;Domain: #{v2["domain"].join(", ")}"
                        tmpHash["description"].gsub! "\"",""
			tmpHash["link"] = v2["siteGroupId"]
			dataReturn[k].push(tmpHash)
		end
          rescue Exception => e
            puts( e.message )
          end
	end
	return dataReturn
end


namespace :phosphoentries do
  desc "Seeds PhosphoSitePlus"
  task seed_phospho: :environment do

    data = {}
    PTMURLs.each do |k,v|
            puts(v)
    	stringData = downloadURL(v)
            puts("download complete")
    	if data.empty?
      	data=processPTMFile(stringData,k)
    	else
    		data.merge!(processPTMFile(stringData,k)){|key,oldval,newval| oldval+newval}
    	end
    end
    
    puts(Disease)
    diseaseRawData = downloadURL(Disease)
    puts("download complete")
    data.merge!(processDiseaseFile(diseaseRawData)){|key,oldval,newval| oldval+newval}
    puts("processed complete")   

    puts(Regulatory)
    regulatoryRawData = downloadURL(Regulatory)
    puts("download complete")
    data.merge!(processRegulatoryFile(regulatoryRawData)){|key,oldval,newval| oldval+newval}
    puts("processed complete")
    
    puts(KinasesURL)
    kinasesRawData = downloadURL(KinasesURL)
    puts("download complete")
    data.merge!(processKinasesFile(kinasesRawData)){|key,oldval,newval| oldval+newval}
    puts("processed complete")

    puts("wirting tsv file")

    file = File.open("#{localAppDB}/mysql/phospho.tsv",'w')
    data.each do |k,v|
    	file.write("NULL\t"+k+"\t"+v.to_json+"\n")
    end
    file.write("\n")
  end

end
