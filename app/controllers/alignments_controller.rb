class AlignmentsController < ApplicationController
 
  SIFTSUrl = "http://ftp.ebi.ac.uk/pub/databases/msd/sifts/xml/"
  UniprotURL = "http://www.uniprot.org/uniprot/"

  AminoDic = {'CYS'=>'C', 'ASP'=>'D', 'SER'=>'S', 'GLN'=>'Q', 'LYS'=>'K','ILE'=>'I', 'PRO'=>'P', 'THR'=>'T', 'PHE'=>'F', 'ASN'=>'N', 'GLY'=>'G', 'HIS'=>'H', 'LEU'=>'L', 'ARG'=>'R', 'TRP'=>'W','ALA'=>'A', 'VAL'=>'V', 'GLU'=>'E', 'TYR'=>'Y', 'MET'=>'M'}
  ModifiedResidues = {'CSD'=>'CYS','HYP'=>'PRO','BMT'=>'THR','5HP'=>'GLU','ABA'=>'ALA','AIB'=>'ALA','CSW'=>'CYS','OCS'=>'CYS','DAL'=>'ALA','DAR'=>'ARG','DSG'=>'ASN','DSP'=>'ASP','DCY'=>'CYS','DGL'=>'GLU','DGN'=>'GLN','DHI'=>'HIS','DIL'=>'ILE','DIV'=>'VAL','DLE'=>'LEU','DLY'=>'LYS','DPN'=>'PHE','DPR'=>'PRO','DSN'=>'SER','DTH'=>'THR','DTY'=>'TYR','DVA'=>'VAL','CGU'=>'GLU','KCX'=>'LYS','LLP'=>'LYS','CXM'=>'MET','FME'=>'MET','MLE'=>'LEU','MVA'=>'VAL','NLE'=>'LEU','PTR'=>'TYR','ORN'=>'ALA','SEP'=>'SER','TPO'=>'THR','PCA'=>'GLU','SAR'=>'GLY','CEA'=>'CYS','CSO'=>'CYS','CSS'=>'CYS','CSX'=>'CYS','CME'=>'CYS','TYS'=>'TYR','TPQ'=>'PHE','STY'=>'TYR'}

  helper_method :generateDigest
  helper_method :getXml
  helper_method :getUrlWithDigest
  helper_method :unzipData
  helper_method :processSIFTS
  helper_method :pdbInfo
  helper_method :getUniprotSequence

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
  
  def unzipData(data)
    begin
      gz = Zlib::GzipReader.new(StringIO.new(data))
      unzipped = gz.read
    rescue
      puts "Error downloading data:\n#{$!}"
    end
    return unzipped
  end

  def getXml(data)
    begin
      hash = Nori.new(:parser=> :nokogiri, :advanced_typecasting => false).parse(data)
    rescue
      puts "Error downloading and reading xml:\n#{$!}"
    end
    return hash
  end

  def getPDBalignment
    info = nil
    pdbId = params[:name]
    url = SIFTSUrl+pdbId+".xml.gz"
    rawData = getUrlWithDigest(url)
    digest = rawData["checksum"]
    dbData = PdbDatum.find_by(pdbId: pdbId)
    if !dbData.nil? and (dbData.digest == digest)
      # lo que buscamos es lo que esta guardado
      info = JSON.parse(dbData.data)
    else
      unzipped = unzipData(rawData["data"])
      dataXml = getXml(unzipped)
      # hay que guardar otra vez
      sifts = processSIFTS(dataXml)
      info = pdbInfo(sifts)
      if !dbData.nil?
        dbData.destroy
      end
      PdbDatum.create(pdbId: pdbId, digest: digest, data: info.to_json)
    end
    return render json: info, status: :ok
  end

  def getPDBalignmentJSONP
    info = nil
    pdbId = params[:name]
    if pdbId == "undefined"
      toReturnInfo = ""
    else
      url = SIFTSUrl+pdbId+".xml.gz"
      rawData = getUrlWithDigest(url)
      digest = rawData["checksum"]
      dbData = PdbDatum.find_by(pdbId: pdbId)
      if !dbData.nil? and (dbData.digest == digest)
        # lo que buscamos es lo que esta guardado
        info = JSON.parse(dbData.data)
      else
        unzipped = unzipData(rawData["data"])
        dataXml = getXml(unzipped)
        # hay que guardar otra vez
        sifts = processSIFTS(dataXml)
        info = pdbInfo(sifts)
        if !dbData.nil?
          dbData.destroy
        end
        PdbDatum.create(pdbId: pdbId, digest: digest, data: info.to_json)
      end
      toReturnInfo = "processAlignment("+info.to_json+")"
    end
    return render text: toReturnInfo, status: :ok
  end

  # TODO el alineamiento entre PDB y Uniprot no es completo
  # para la parte del string, cuando el PDB empieza antes de
  # las coordenadas de inicio de Uniprot (y me imagino que
  # al final sera igual) parte del PDB no queda mapeado
  def processSIFTS(hash)
    siftSalida = Hash.new
    # cada entidad es una cadena
    miEntity = []
    if hash["entry"]["entity"].class == Hash
      miEntity.push(hash["entry"]["entity"])
    elsif hash["entry"]["entity"].class == Array
      miEntity = hash["entry"]["entity"]
    end
    miEntity.each do |it|
      # solo hago algo si la entidad es una proteina
      if it["@type"]=="protein"
        #cadena = it["@entityId"]
        # en la docu pone que puede haber más de un segmento, así que preveo
        # que sea un array y lo paso todido a array para que el codigo sea uno
        if it["segment"].class == Hash
          segs = [it["segment"]]
        elsif it["segment"].class == Array
          segs = it["segment"]
        end
        #itero por segmento
        segs.each do |miSeg|
          #itero por residuo
          if miSeg["listResidue"]["residue"].class == Hash
            residues = [miSeg["listResidue"]["residue"]]
          elsif miSeg["listResidue"]["residue"].class == Array
            residues = miSeg["listResidue"]["residue"]
          end
          residues.each do |res|
            # como puede haber varios residueDetail, lo convierto todo a array
            # y pongo un flag si aparece no observado
            resArray = []
            if !res["residueDetail"].nil?
              if res["residueDetail"].class == Nori::StringWithAttributes
                resArray.push(res["residueDetail"])
              elsif res["residueDetail"].class == Array
                resArray = res["residueDetail"]
              end
            end
            structure = true
            resArray.each do |resEl|
              if resEl == "Not_Observed"
                structure = false
              end
            end
            # miro que el residuo tenga estructura 3d, si no no aparece en pdb con coordenadas
            if structure
              #miro que tenga entradas para pdb y uniprot
              uniprotRes = res["crossRefDb"].select{|db| db["@dbSource"]=="UniProt"}
              pdbRes = res["crossRefDb"].select{|db| db["@dbSource"]=="PDB"}
              if !uniprotRes.empty? and !pdbRes.empty?
                chainReal = pdbRes[0]["@dbChainId"]
                if siftSalida[chainReal].nil?
                  siftSalida[chainReal] = Hash.new
                end
                # creo elementos del hash
                if siftSalida[chainReal][uniprotRes[0]["@dbAccessionId"]].nil?
                  siftSalida[chainReal][uniprotRes[0]["@dbAccessionId"]] = Hash.new
                end
                # hago correspondencia entre indice de uniprot y pdb
                finalResidue = "X"
                initialRes = pdbRes[0]["@dbResName"]
                modified = true
                if !AminoDic[pdbRes[0]["@dbResName"]].nil?
                  modified = false
                  finalResidue = AminoDic[pdbRes[0]["@dbResName"]]
                elsif !AminoDic[ModifiedResidues[pdbRes[0]["@dbResName"]]].nil?
                  finalResidue = AminoDic[ModifiedResidues[pdbRes[0]["@dbResName"]]]
                end
                # Si ya se ha utilizado esta posicion, es que hay heterogeneidad
                # y se añade el valor al hash
                if !siftSalida[chainReal][uniprotRes[0]["@dbAccessionId"]][uniprotRes[0]["@dbResNum"]].nil? and (siftSalida[chainReal][uniprotRes[0]["@dbAccessionId"]][uniprotRes[0]["@dbResNum"]]["residue"]!=finalResidue)
                  # Se crea un array con los residuos posibles si es la primera vez
                  # que se entra
                  if siftSalida[chainReal][uniprotRes[0]["@dbAccessionId"]][uniprotRes[0]["@dbResNum"]]["heterogeneity"].nil?
                    siftSalida[chainReal][uniprotRes[0]["@dbAccessionId"]][uniprotRes[0]["@dbResNum"]]["heterogeneity"] = Array.new
                    siftSalida[chainReal][uniprotRes[0]["@dbAccessionId"]][uniprotRes[0]["@dbResNum"]]["heterogeneity"].push(siftSalida[chainReal][uniprotRes[0]["@dbAccessionId"]][uniprotRes[0]["@dbResNum"]]["residue"])
                  end
                  siftSalida[chainReal][uniprotRes[0]["@dbAccessionId"]][uniprotRes[0]["@dbResNum"]]["heterogeneity"].push(finalResidue)
                else
                  siftSalida[chainReal][uniprotRes[0]["@dbAccessionId"]][uniprotRes[0]["@dbResNum"]]={"pos"=>pdbRes[0]["@dbResNum"],"residue"=>finalResidue}
                  if modified
                    siftSalida[chainReal][uniprotRes[0]["@dbAccessionId"]][uniprotRes[0]["@dbResNum"]]["modified"] = initialRes
                  end
                end
              end
            end
          end
        end
      end
    end
    return siftSalida
  end

  def pdbInfo(sifts)
    # cojo la correspondencia entre uniprot y pdb de SIFTS
    info = Hash.new
    # itero por los uniprots
    sifts.each do |chain,uniprots|
      info[chain] = Hash.new
      # itero por cadenas
      uniprots.each do |uni,mappings|
        info[chain][uni] = Hash.new
        # creo un array de posiciones por cada uniprot, con
        # el tamaño de la longitud de secuencia, inicializando
        # cada elemento con un hash nuevo vacio
        info[chain][uni]["mapping"] = Array.new
        fastaUniprot = getUniprotSequence(uni)
        info[chain][uni]["uniprotSeq"] = fastaUniprot.seq
        (0..(fastaUniprot.length-1)).to_a.each do |ind|
          info[chain][uni]["mapping"][ind] = Hash.new
        end
        info[chain][uni]["pdbSeq"] = "-" * fastaUniprot.length
        # itero por elementos con correspondencia de indices
        mappings.each do |uniIndex,tupla|
          pdbIndex = tupla["pos"]
          pdbRes = tupla["residue"]
          if info[chain][uni]["mapping"][uniIndex.to_i-1].nil?
            info[chain][uni]["mapping"][uniIndex.to_i-1] = Hash.new
          end
          info[chain][uni]["mapping"][uniIndex.to_i-1]["pdbIndex"] = pdbIndex.to_i
          info[chain][uni]["pdbSeq"][uniIndex.to_i-1] = pdbRes
          if !tupla["heterogeneity"].nil?
            if info[chain][uni]["mapping"][uniIndex.to_i-1]["pdbAnnots"].nil?
              info[chain][uni]["mapping"][uniIndex.to_i-1]["pdbAnnots"] = Hash.new
            end
            info[chain][uni]["mapping"][uniIndex.to_i-1]["pdbAnnots"]["heterogeneity"] = tupla["heterogeneity"]
          end
          if !tupla["modified"].nil?
            if info[chain][uni]["mapping"][uniIndex.to_i-1]["pdbAnnots"].nil?
              info[chain][uni]["mapping"][uniIndex.to_i-1]["pdbAnnots"] = Hash.new
            end
            info[chain][uni]["mapping"][uniIndex.to_i-1]["pdbAnnots"]["modifications"] = tupla["modified"]
          end
        end
      end
    end
    return info
  end

  def getUniprotSequence(uniprotAc)
    begin
      data = Net::HTTP.get_response(URI.parse(UniprotURL+uniprotAc+".fasta")).body
    rescue
      puts "Error: #{$!}"
    end
    fasta = Bio::FastaFormat.new(data)
    return fasta
  end
  
end
