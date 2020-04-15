require 'net/http'
BiomutaUrl = "https://hive.biochemistry.gwu.edu/tools/biomuta/download2.php?f=BioMuta2.csv"
def downloadNoZipURL(url)
	begin
		data = Net::HTTP.get_response(URI.parse(url)).body
	rescue Errno::ECONNREFUSED
		retry
	rescue
		puts "Error: #{$!}"
	end
	return data
end

def processBiomuta(data)
	data = data.lines[1..-1]
	mutations = {}
	data.each do |l|
		tmp = {}
		linea = l.chomp.split("\t")
		uniprotAc = linea[0].strip
		position = linea[7].strip
		original = linea[8].strip
		variation = linea[9].strip
		polyphen = linea[10].strip
		pubmed = linea[11].strip
		disease = linea[12].strip
		source = linea[13].strip
		tmp["position"] = position
		tmp["original"] = original
		tmp["variation"] = variation
		tmp["polyphen"] = polyphen
		tmp["references"] = [pubmed]
		tmp["disease"] = disease
		tmp["source"] = source
		tmp["type"] = "Pathology and Biotech"
		mutations[uniprotAc] ||= []
		mutations[uniprotAc].push(tmp)
	end
	return mutations
end

data = downloadNoZipURL(BiomutaUrl)
final = processBiomuta(data)
puts final["A0A183"].inspect
