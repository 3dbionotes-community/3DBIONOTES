class AnnotationsController < ApplicationController

  UniprotURL = "http://www.uniprot.org/uniprot/"
  DsysmapURL = "http://dsysmap.irbbarcelona.org/api/getMutationsForProteins?protein_ids="

  UniprotSections = {'Function'=>['active site','binding site','calcium-binding region','DNA-binding region','lipid moiety-binding region','metal ion-binding site','nucleotide phosphate-binding region','site','zinc finger region'],'PTM/Processing'=>['chain','cross-link','disulfide bond','glycosylation site','initiator methionine','modified residue','peptide','propeptide','signal peptide','transit peptide'],'Family and Domains'=>['coiled-coil region','compositionally biased region','domain','region of interest','repeat','short sequence motif'],'Structure'=>['helix','strand','turn'],'Subcellular location'=>['transmembrane region','topological domain','intramembrane region'],'Pathology and Biotech'=>['mutagenesis site'],'Sequence'=>['non-consecutive residues','non-terminal residue','non-standard amino acid','sequence conflict','sequence variant','unsure residue','splice variant']}

  helper_method :generateDigest
  helper_method :getXml
  helper_method :getUrlWithDigest
  helper_method :fetchUniprotAnnots
  helper_method :getUniprotSequence
  helper_method :getIEDB


  def getBiomutaFromUniprot
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

  def getIEDB(uniprot)
    client = Mysql2::Client.new(
      username: "root",
      database: "IEDB",
      password: "peron-1"
    )
    gi = Iedbdictionary.find_by(uniprot: uniprot)
    out = []
    if !gi.nil? and !gi["gi"].nil? and !gi["gi"].empty?
      giComillas = "\""+gi["gi"].gsub(",","\",\"")+"\""
      query = "select distinct e.epitope_id, ee.linear_peptide_seq, o.starting_position, o.ending_position from epitope ee, epitope_object e, object o where ee.epitope_id=e.epitope_id and  e.object_id=o.object_id and e.source_antigen_accession in (#{giComillas}) and o.object_type = \"Fragment of a Natural Sequence Molecule\";"
      client.query(query).each do |row|
        out.push({ 'start':row['starting_position'],'end':row['ending_position'],'type':'epitope','description':row['linear_peptide_seq'],'evidence':row['epitope_id'] })
        print "\n"
      end
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

  def getUniprotAnnotations
    source = "uniprot"
    uniprotAc = params[:name]
    url = UniprotURL+uniprotAc+".xml"
    rawData = getUrlWithDigest(url)
    digest = rawData["checksum"]
    dbData = Annotation.find_by(proteinId: uniprotAc,source: source)
    if !dbData.nil? and (dbData.digest == digest)
      # lo que buscamos es lo que esta guardado
      info = JSON.parse(dbData.data)
    else
      # hay que guardar otra vez
      hashData = getXml(rawData["data"])
      info = fetchUniprotAnnots(hashData)
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

  def fetchUniprotAnnots(hashData)
    data = {}
    data["general"] = {} 
    data["particular"] = []
    if !hashData.empty?
      featuresList = []
      # miro que haya features y las paso siempre a array
      if hashData["uniprot"]["entry"]["feature"].class == Array
        featuresList = hashData["uniprot"]["entry"]["feature"]
      elsif hashData["uniprot"]["entry"]["feature"] == Hash
        featuresList.push(hashData["uniprot"]["entry"]["feature"])
      end
      #solo se hace algo si la lista de features es mayor que 0
      if featuresList.length > 0
        evidencesList = []
        # miramos que haya evidencias
        if hashData["uniprot"]["entry"]["evidence"].class == Array
          evidencesList = hashData["uniprot"]["entry"]["evidence"]
        elsif hashData["uniprot"]["entry"]["evidence"].class == Hash
          evidencesList.push(hashData["uniprot"]["entry"]["evidence"])
        end
        commentsList = []
        if hashData["uniprot"]["entry"]["comment"].class == Array
          commentsList = hashData["uniprot"]["entry"]["comment"]
        elsif hashData["uniprot"]["entry"]["comment"] == Hash
          commentsList.push(hashData["uniprot"]["entry"]["comment"])
        end
        tmpComments = {}
        tmpGeneralComments = {}
        commentsList.each do |comment|
          evidence = nil
          if !comment["@evidence"].nil?
            evidence = comment["@evidence"].split(" ")
          end
          if !comment["text"].nil?
            if !comment["text"].attributes.empty?
              if !comment["text"].attributes["evidence"].nil?
                evidence = comment["text"].attributes["evidence"].split(" ")
              end
            end
          end
          if !evidence.nil?
            evidence.each do |myEvi|
              miTmpComment = {}
              miTmpComment["type"] = comment["@type"]
              if !comment["@name"].nil?
                miTmpComment["name"] = comment["@name"]
              end
              if !comment["text"].nil?
                miTmpComment["description"] = comment["text"]
              end
              if comment["@type"]=="disease"
                if !comment["disease"].nil?
                  miTmpComment["additional"] = {}
                  miTmpComment["additional"]["disease"] = {}
                  tmpDiseaseText = ""
                  if !comment["disease"]["name"].nil?
                    tmpDiseaseText+="Name: "+ comment["disease"]["name"] +"\n"
                  end
                  if !comment["disease"]["acronym"].nil?
                    tmpDiseaseText+="Acronym: "+ comment["disease"]["acronym"] +"\n"
                  end
                  if !comment["disease"]["description"].nil?
                    tmpDiseaseText+="Description: "+ comment["disease"]["description"] +"\n"
                  end
                  if !tmpDiseaseText.empty?
                    miTmpComment["additional"]["disease"]["text"] = tmpDiseaseText
                  end
                  if !comment["disease"]["dbReference"].nil?
                    miTmpComment["additional"]["disease"]["reference"] = "#{comment["disease"]["dbReference"]["@type"]}:#{comment["disease"]["dbReference"]["@id"]}"
                  end
                end
              end
              if tmpComments[myEvi].nil?
                tmpComments[myEvi] = []
              end
              tmpComments[myEvi].push(miTmpComment)
            end
          end
          if comment["@evidence"].nil?
            if !comment["@type"].nil?
              # Esto significa que el tipo del comentario es una subseccion, y se puede anadir
              # como comentario general
              if (UniprotSections.keys).include?(comment["@type"].capitalize)
                miTmpGeneralComment = ""
                if !comment["text"].nil?
                  miTmpGeneralComment += "Note: " + comment["text"] + "\n"
                end
                clavesNoTerm = comment.keys.select{|el| el[0]!="@"}.uniq
                clavesNoTerm.each do |clave|
                  if !comment[clave].nil?
                    miComments = []
                    if comment[clave].class == Hash
                      miComments = [comment[clave]]
                    elsif comment[clave].class == Array
                      miComments = comment[clave]
                    end
                    miComments.each do |miComment|
                      clavesIn = miComment.keys.select{|el| el[0]!="@"}
                      inTmpGeneralComment = "•"
                      clavesIn.each do |clavin|
                        if !miComment[clavin].nil?
                          if miComment[clavin].class == Array
                            inTmpGeneralComment += miComment[clavin].join(", ") + "; "
                          elsif miComment[clavin].class == String or miComment[clavin].class == Nori::StringWithAttributes
                            inTmpGeneralComment += miComment[clavin] + "; "
                          end
                        end
                      end
                      inTmpGeneralComment = inTmpGeneralComment[0..-3]
                      miTmpGeneralComment += inTmpGeneralComment + "\n"
                    end
                  end
                  if miTmpGeneralComment!=""
                    if tmpGeneralComments[comment["@type"].capitalize].nil?
                      tmpGeneralComments[comment["@type"].capitalize] = ""
                    end
                    tmpGeneralComments[comment["@type"].capitalize] = miTmpGeneralComment
                  end
                end
              end
            end
          end
        end
        data["general"] = tmpGeneralComments
        tmpEvidences = {}
        evidencesList.each do |evidence|
          # key campo obligatorio en xsd
          tmpEvidences[evidence["@key"]] = {}
          # datos de lo anterior
  
          if !tmpComments[evidence["@key"]].nil?
            tmpEvidences[evidence["@key"]]["info"] = tmpComments[evidence["@key"]]
          end
          # campo obligatorio
          tmpEvidences[evidence["@key"]]["code"] = evidence["@type"]
          # campo opcional
          if !evidence["source"].nil?
            # campo opcional (es una lista)
            if !evidence["source"]["dbReference"].nil?
              dbRefs = []
              tmpDbRefs = []
              if evidence["source"]["dbReference"].class == Hash
                dbRefs.push(evidence["source"]["dbReference"])
              elsif evidence["source"]["dbReference"].class == Array
                dbRefs = evidence["source"]["dbReference"]
              end
              dbRefs.each do |dbRef|
                tmpDbRefs.push("#{dbRef["@type"]}:#{dbRef["@id"]}")
              end
              # campos obligatorios
              tmpEvidences[evidence["@key"]]["references"] = tmpDbRefs
            end
          end
        end
        # itero a traves de los features
        featuresList.each do |feature|
          tmpHash = {}
          # opcional
          if !feature["location"].nil?
            if !feature["location"]["position"].nil?
              tmpHash["start"]=feature["location"]["position"]["@position"].to_i
              tmpHash["end"]=feature["location"]["position"]["@position"].to_i
            elsif !feature["location"]["begin"].nil? and !feature["location"]["end"].nil?
              tmpHash["start"]=feature["location"]["begin"]["@position"].to_i
              tmpHash["end"]=feature["location"]["end"]["@position"].to_i
            end
            UniprotSections.each do |k,v|
              if v.include?(feature["@type"])
                tmpHash["type"] = k
              end
            end
            # obligatorio en el xsd
            tmpHash["subtype"] = feature["@type"]
            # opcional
            if !feature["original"].nil?
              tmpHash["original"] = feature["original"]
            end
            if !feature["variation"].nil?
              tmpHash["variation"] = feature["variation"]
            end
            # opcional
            if !feature["@description"].nil?
              tmpHash["description"] = feature["@description"]
            end
            # opcional
            if !feature["@evidence"].nil?
              evidences = feature["@evidence"].split(" ")
              tmpHash["evidence"] = Array.new
              evidences.each do |evi|
                tmpHash["evidence"].push(tmpEvidences[evi])
              end
            end
            data["particular"].push(tmpHash)
          end
        end
      end
    end
    return data
  end

end
