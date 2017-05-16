class AnnotationsController < ApplicationController

  UniprotURL = "http://www.uniprot.org/uniprot/"
  DsysmapURL = "http://dsysmap.irbbarcelona.org/api/getMutationsForProteins?protein_ids="
  EnsemblURL = "http://rest.ensembl.org/"
  PfamURL = "http://pfam.xfam.org/"
  MobiURL = "http://mobidb.bio.unipd.it/ws/entries/"
  SmartURL = "http://smart.embl.de/smart/batch.pl?TEXTONLY=1&INCLUDE_SIGNALP=1&IDS="
  InterproURL = "https://www.ebi.ac.uk/interpro/protein/"

  helper_method :generateDigest
  helper_method :getXml
  helper_method :getUrlWithDigest
  helper_method :getUniprotSequence
  helper_method :getIEDB

  def getBiomutaFromUniprot
    uniprotAc = params[:name]
    info = Biomutaentry.where(proteinId: uniprotAc)
    toReturn = []
    if !info.nil?
      info.each do |i|
        d = JSON.parse(i["data"])
        toReturn.push(*d)
      end
    end
    return render json: toReturn, status: :ok
  end

  def __getBiomutaFromUniprot
    uniprotAc = params[:name]
    info = Biomutaentry.find_by(proteinId: uniprotAc)
    toReturn = []
    if !info.nil? and !info["data"].nil?
      toReturn=info["data"]
    end
    return render json: toReturn, status: :ok
  end

  def getPhosphositeFromUniprot
    uniprotAc = params[:name]
    info = Phosphoentry.find_by(proteinId: uniprotAc)
    toReturn = []
    if !info.nil? and !info["data"].nil?
      toReturn=info["data"]
    end
    return render json: toReturn, status: :ok
  end

  def getDbptmFromUniprot 
    uniprotAc = params[:name]
    info = Dbptmentry.find_by(proteinId: uniprotAc)
    toReturn = []
    if !info.nil? and !info["data"].nil?
      toReturn=info["data"]
    end
    return render json: toReturn, status: :ok
  end

  def getIEDB(uniprot)
    client = Mysql2::Client.new(
      username: "root",
      database: "IEDB",
      password: "peron-1"
    )
    out = []
    query = "select distinct e.epitope_id, ee.linear_peptide_seq, o.starting_position, o.ending_position from epitope ee, epitope_object e, object o where ee.epitope_id=e.epitope_id and  e.object_id=o.object_id and e.source_antigen_accession in (\""+uniprot+"\",\""+uniprot+".1\") and o.object_type = \"Fragment of a Natural Sequence Molecule\";"
    client.query(query).each do |row|
      out.push({ 'start':row['starting_position'],'end':row['ending_position'],'type':'epitope','description':row['linear_peptide_seq'],'evidence':row['epitope_id'] })
      print "\n"
    end
    return out
  end

  def getIEDBfromUniprot
    uniprotAc = params[:name]
    info = getIEDB(uniprotAc)
    return render json: info, status: :ok
  end

  def getUniprotSequence(uniprotAc)
    begin
      data = `ssh  jsegura@campins '~/apps/BLAST/ncbi-blast-2.5.0+/bin/blastdbcmd -entry #{uniprotAc} -db /home/jsegura/databases/UNIPROT/blast/sprot/sprot'`
      if data.length == 0
        data = `ssh  jsegura@campins '~/apps/BLAST/ncbi-blast-2.5.0+/bin/blastdbcmd -entry #{uniprotAc} -db /home/jsegura/databases/UNIPROT/blast/trembl/trembl'`
      end
      if data.length == 0
        data = Net::HTTP.get_response(URI.parse(UniprotURL+uniprotAc+".fasta")).body
      end
    rescue
      puts "Error: #{$!}"
    end
    fasta = Bio::FastaFormat.new(data)
    return fasta
  end

  def __getUniprotSequence(uniprotAc)
    begin
      data = Net::HTTP.get_response(URI.parse(UniprotURL+uniprotAc+".fasta"))
    rescue
      puts "Error: #{$!}"
    end
    fasta = nil
    if data.code != "404"
      fasta = Bio::FastaFormat.new(data.body)
    end
    return fasta
  end

  def __getUniprotMultipleSequences
    uniprotAc = params[:name]
    returnValue = {}
    begin

      data = `ssh  jsegura@campins '~/apps/BLAST/ncbi-blast-2.5.0+/bin/blastdbcmd -entry #{uniprotAc} -db /home/jsegura/databases/UNIPROT/blast/sprot/sprot'`
      if data.length == 0
        data = `ssh  jsegura@campins '~/apps/BLAST/ncbi-blast-2.5.0+/bin/blastdbcmd -entry #{uniprotAc} -db /home/jsegura/databases/UNIPROT/blast/trembl/trembl'`
      end
      if data.length == 0
        if uniprotAc.split(",").length > 1
          data = Net::HTTP.get_response(URI.parse(UniprotURL+"?query="+uniprotAc+"&format=fasta")).body
        else
          data = Net::HTTP.get_response(URI.parse(UniprotURL+uniprotAc+".fasta")).body
        end
      end

    rescue
      puts "Error: #{$!}"
      data = 404
    end
    fasta = nil
    if data != "404"
      fasta = Bio::Alignment::MultiFastaFormat.new(data)
    end
    fasta.entries.each do |entry|
      definition = ""
      accession = ""
      if entry.definition =~/sp/
        definition = entry.definition.split(/\|/)[2].split(/\sOS=/)[0].split(/\s/,2)[1].upcase
        accession = entry.accession
      else
        aux = entry.definition
        accession = aux.split(/\s/)[0]
        aux = aux.sub  "\s" , "|"
        definition = aux.split(/\|/)[1].split(/\sOS=/)[0].split(/\s/,2)[1].upcase
      end
      returnValue[accession] = [entry.seq.length,definition]
    end
    return render json: returnValue, status: :ok
  end

  def getUniprotMultipleSequences
    uniprotAc = params[:name]
    returnValue = {}
    begin
      if uniprotAc.split(",").length > 1
        data = Net::HTTP.get_response(URI.parse(UniprotURL+"?query="+uniprotAc+"&format=fasta"))
      else
        data = Net::HTTP.get_response(URI.parse(UniprotURL+uniprotAc+".fasta"))
      end
    rescue
      puts "Error: #{$!}"
    end
    fasta = nil
    if data.code != "404"
      fasta = Bio::Alignment::MultiFastaFormat.new(data.body)
    end
    if !fasta.nil? && !fasta.entries.nil?
      fasta.entries.each do |entry|
        entry_definition = "Unknown"
        if !entry.definition.nil? and entry.definition.include? "|" and entry.definition.include? "OS="
          aux = entry.definition.split(/\|/)[2].split(/\sOS=/)
          entry_definition = aux[0].split(/\s/,2)[1]
          aux = aux[1].split(/ GN=/,2)
          organism_name = aux[0]
          gene_symbol = "N/A"
          if !aux[1].nil?
            gene_symbol = aux[1].split(/ PE=/,2)[0]
          else
            organism_name = organism_name.split(/ PE=/,2)[0]
          end
        end
        returnValue[entry.accession] = [entry.seq.length,entry_definition,gene_symbol,organism_name]
      end
    end
    return render json: returnValue, status: :ok
  end
 
  def generateDigest(cadena)
    return Digest::SHA256.hexdigest(cadena)
  end

  def getUrlWithDigest(url)
    begin
      data = Net::HTTP.get_response(URI.parse(url)).body
      digest = generateDigest(data)
    rescue
      puts "Error downloading data:\n#{$!}"
    end
    return {"data"=>data,"checksum"=>digest}
  end

  def getXml(data)
    begin
      hash = Nori.new(:parser=> :nokogiri, :advanced_typecasting => false).parse(data)
    rescue
      puts "Error downloading and reading xml:\n#{$!}"
    end
    return hash
  end

  def fetchDsysmapAnnots(hashData)
    output = []
    if !hashData["results"].nil?
      if !hashData["results"]["mutations"].nil?
        if !hashData["results"]["mutations"]["mutation"].nil?
          mutations = []
          if hashData["results"]["mutations"]["mutation"].class == Hash
            mutations = [hashData["results"]["mutations"]["mutation"]]
          elsif hashData["results"]["mutations"]["mutation"].class == Array
            mutations = hashData["results"]["mutations"]["mutation"]
          end
          mutations.each do |mut|
            tmp = {}
            characts = []
            if !mut["disease"].nil? and !mut["mim"].nil?
              tmp["disease"] = {"text"=>mut["disease"],"reference"=>mut["mim"]}
            end
            if !mut["phenotype"].nil?
              characts.push("Phenotype: "+mut["phenotype"])
            end
            if !mut["res_num"].nil?
              tmp["start"] = mut["res_num"].to_i
              tmp["end"] = mut["res_num"].to_i
              tmp["position"] = mut["res_num"]
            end
            if !mut["res_orig"].nil?
              tmp["original"] = mut["res_orig"]
            end
            if !mut["res_mut"].nil?
              tmp["variation"] = mut["res_mut"]
            end
            references = []
            if !mut["swissvar_id"].nil?
              references.push({"references"=>["swissvar:"+mut["swissvar_id"]]})
            end
            if !references.empty?
              tmp["evidence"] = references
            end
            if !characts.empty?
              tmp["description"] = ";;"+characts.join(";;")
            end
            tmp["type"] = "Pathology and Biotech"
            output.push(tmp)
          end
        end
      end
    end
    return output
  end

  def getDsysmapFromUniprot
    source = "dsysmap"
    uniprotAc = params[:name]
    url = DsysmapURL + uniprotAc
    rawData = getUrlWithDigest(url)
    digest = rawData["checksum"]
    dbData = Annotation.find_by(proteinId: uniprotAc,source: source)
    if !dbData.nil? and (dbData.digest == digest)
      # lo que buscamos es lo que esta guardado
      info = JSON.parse(dbData.data)
    else
      # hay que guardar otra vez
      hashData = getXml(rawData["data"])
      info = fetchDsysmapAnnots(hashData)
      if !dbData.nil?
        dbData.destroy
      end
      Annotation.create(proteinId: uniprotAc, source: source, digest: digest, data: info.to_json)
    end
    return render json: info, status: :ok
  end

  def getUniprotLength
    uniprotAc = params[:name]
    uniLength = getUniprotSequence(uniprotAc).seq.length
    return render json: uniLength, status: :ok
  end

  def getENSEMBLvariants
    ensembl_id = params[:name]
    out = {'variation'=>[],'somatic_variation'=>[]}
    returnValue = {}
    begin
      data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=variation;variant_set=ph_variants;content-type=application/json"))
    rescue
      puts "Error: #{$!}"
    end
    if data.code != "404"
      returnValue = JSON.parse(data.body)
    end
    if returnValue.is_a?(Array)
      returnValue.each do |i|
        __start = i['start']
        __end = i['end']
        if i['end'] < i['start']
          __start = i['end']
          __end = i['start']
        end
        out['variation'].push({'x'=>__start,'y'=>__end,'alleles'=>i['alleles'],'clinical_significance'=>i['clinical_significance'],'consequence_type'=>i['consequence_type'],'strand'=>i['strand']})
      end
    end
   
    returnValue = {}
    begin
      data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=somatic_variation;variant_set=ph_variants;content-type=application/json"))
    rescue
      puts "Error: #{$!}"
    end
    if data.code != "404"
      returnValue = JSON.parse(data.body)
    end
    returnValue.each do |i|
      __start = i['start']
      __end = i['end']
      if i['end'] < i['start']
        __start = i['end']
        __end = i['start']
      end
      out['somatic_variation'].push({'x'=>__start,'y'=>__end,'alleles'=>i['alleles'],'clinical_significance'=>i['clinical_significance'],'consequence_type'=>i['consequence_type'],'strand'=>i['strand']})
    end

    return render json: out, status: :ok
  end

  def getENSEMBLannotations
    ensembl_id = params[:name]
    out = {'repeat'=>[],'simple'=>[],'constrained'=>[],'motif'=>[]}
    returnValue = {}
    begin
      data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=repeat;content-type=application/json"))
    rescue
      puts "Error: #{$!}"
    end
    if data.code != "404"
      returnValue = JSON.parse(data.body)
    end
    returnValue.each do |i|
      out['repeat'].push({'x'=>i['start'],'y'=>i['end'],'description'=>i['description'],'strand'=>i['strand']})
    end
   
    begin
      data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=simple;content-type=application/json"))
    rescue
      puts "Error: #{$!}"
    end
    if data.code != "404"
      returnValue = JSON.parse(data.body)
    end
    returnValue.each do |i|
      out['simple'].push({'x'=>i['start'],'y'=>i['end'],'description'=>i['logic_name'],'strand'=>i['strand']})
    end

    begin
      data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=constrained;content-type=application/json"))
    rescue
      puts "Error: #{$!}"
    end
    if data.code != "404"
      returnValue = JSON.parse(data.body)
    end
    returnValue.each do |i|
      out['constrained'].push({'x'=>i['start'],'y'=>i['end'],'description'=>i['logic_name'],'strand'=>i['strand']})
    end

    begin
      data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=motif;content-type=application/json"))
    rescue
      puts "Error: #{$!}"
    end
    if data.code != "404"
      returnValue = JSON.parse(data.body)
    end
    returnValue.each do |i|
      out['motif'].push({'x'=>i['start'],'y'=>i['end'],'description'=>i['motif_feature_type'],'strand'=>i['strand']})
    end

    begin
      data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=transcript;feature=exon;content-type=application/json"))
    rescue
      puts "Error: #{$!}"
    end
    if data.code != "404"
      returnValue = JSON.parse(data.body)
    end

    out['transcripts'] = {'coding'=>{},'non_coding'=>{} }
    transcript = {}

    returnValue.each do |i|
      if i['feature_type'] == 'transcript' && i['Parent'] == ensembl_id
        transcript[ i['transcript_id'] ] = { 'external_name'=>i['external_name'],'biotype'=>i['biotype'] }
      end
    end

    

    returnValue.each do |i|
      if (i['feature_type'] != 'exon') or (not transcript.key?( i['Parent'] ))
        next
      end
      type = 'non_coding'
      if transcript[ i['Parent'] ][ 'biotype' ] == 'protein_coding'
        type = 'coding'
      end
      name = transcript[ i['Parent'] ][ 'external_name' ]

      if out['transcripts'][ type ].key?( name )
        out['transcripts'][ type ][ name ].push( {'x'=>i['start'],'y'=>i['end']} )
      else
        out['transcripts'][ type ][ name ] = []
        out['transcripts'][ type ][ name ].push( {'x'=>i['start'],'y'=>i['end']} )
      end
    end
    return render json: out, status: :ok
  end

  def getELMDBfromUniprot
    uniprot_acc = params[:name]
    cmd = "/home/joan/tools/ELMDB_tool/get_elm_data "+uniprot_acc
    out = `#{cmd}`
    return render json: out, status: :ok
  end

  def getPfamInfo(pfam_acc)
    url = PfamURL+"family/"+pfam_acc+"?output=xml"
    begin
      data = Net::HTTP.get_response(URI.parse(url)).body
    rescue
      puts "Error downloading data:\n#{$!}"
    end   
    hash = Nori.new(:parser=> :nokogiri, :advanced_typecasting => false).parse(data)   
    description = hash["pfam"]["entry"]["description"].gsub(/\n/, "")
    category = []
    if hash["pfam"]["entry"].key?("go_terms") && hash["pfam"]["entry"]["go_terms"]["category"].class == Hash
      category = [ hash["pfam"]["entry"]["go_terms"]["category"] ]
    elsif hash["pfam"]["entry"].key?("go_terms")
      category = hash["pfam"]["entry"]["go_terms"]["category"]
    end
    go = {}
    category.each do |c|
      go_class = c["@name"]
      go[ go_class ] = []

      if c["term"].class != Array
        terms = [ c["term"] ]
      else
        terms = c["term"]
      end
      terms.each do |t|
        go[ go_class ].push( t )
      end
    end

    out = {'description'=>description,'go'=>go}
    return out
  end

  def getPfamFromUniprot
    uniprot_acc = params[:name]
    url = PfamURL+"protein/"+uniprot_acc+"?output=xml"
    begin
      data = Net::HTTP.get_response(URI.parse(url)).body
    rescue
      puts "Error downloading data:\n#{$!}"
    end   
    hash = Nori.new(:parser=> :nokogiri, :advanced_typecasting => false).parse(data)
    data = []
    if  !hash.nil? && !hash["pfam"].nil? && !hash["pfam"]["entry"].nil? && hash["pfam"]["entry"].key?("matches") && hash["pfam"]["entry"]["matches"]["match"].class == Hash
      data = [ hash["pfam"]["entry"]["matches"]["match"] ]
    elsif !hash.nil? && !hash["pfam"].nil? && !hash["pfam"]["entry"].nil? && hash["pfam"]["entry"].key?("matches")
      data  = hash["pfam"]["entry"]["matches"]["match"]
    end
    out = []
    data.each do |i|
      info = getPfamInfo( i['@accession'] )
      out.push( {'start'=>i['location']['@start'],'end'=>i['location']['@end'],'acc'=>i['@accession'],'id'=>i['@id'], 'info'=>info} )
    end
    return render json: out, status: :ok
  end

  def getMobiFromUniprot
    uniprot_acc = params[:name]
    url = MobiURL+"/"+uniprot_acc+"/disorder"
    begin
      data = Net::HTTP.get_response(URI.parse(url)).body
    rescue
      puts "Error downloading data:\n#{$!}"
    end   
    data = JSON.parse(data)
    out = {}
    if data.key?("consensus") 
        for j in ['disprot','pdb_nmr','pdb_xray','predictors']
          if data['consensus'].key?(j)
            out[j] = []
    	    data['consensus'][j].each do |i|
              if i['ann'] == "D" or i['ann'] == "d"
    	        out[j].push( {'start'=>i['start'],'end'=>i['end']} )
              end
    	    end
          end
        end
    end
    return render json: out, status: :ok
  end

  def getSMARTfromUniprot
    uniprot_acc = params[:name]
    url = SmartURL+uniprot_acc
    begin
      data = Net::HTTP.get_response(URI.parse(url)).body
    rescue
      puts "Error downloading data:\n#{$!}"
    end   
    data = data.gsub(/\n\n/,"\n")
    data = data.split("\n")

    k = data.shift()
    while k && k.exclude?("DOMAIN") && k.exclude?("FINISHED") do
      k = data.shift()
    end

    out = []
    while k && k.exclude?("FINISHED") do
      ann = {}
      if k.include?("DOMAIN")
        r = k.split("=")
        ann[r[0].downcase]=r[1]
      end
      k = data.shift()
      while k && k.exclude?("FINISHED") && k.exclude?("DOMAIN") do
        r = k.split("=")
        ann[r[0].downcase]=r[1]       
        k = data.shift()
      end 
      if ann['type'].exclude?("PFAM") && ann['status'].include?("visible") 
        out.push(ann)
      end
    end

    return render json: out, status: :ok
  end

  def getInterproFromUniprot
    uniprot_acc = params[:name]
    url = InterproURL+uniprot_acc
    wget = `wget -qO- https://www.ebi.ac.uk/interpro/protein/#{uniprot_acc}  | grep '/interpro/popup/supermatch' | sed 's/"//g'`
    data = wget.split("\n")
    out = []
    data.each do |i|
      r = i.split("&")
      ann = {}
      r.each do |j|
        s = j.split("=")
        ann[s[0]]=s[1]
      end
      ids = ann['entryAcs'].split(',')
      id = ids.pop()
      info = Interproentry.find_by(proteinId: id)
      if !info.nil?
        out.push({'id'=>id,'start'=>ann['start'],'end'=>ann['end'],'description'=>JSON.parse(info['data'])})
      end
    end
    return render json: out, status: :ok
  end

end
