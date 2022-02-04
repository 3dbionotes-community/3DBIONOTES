module AlignmentsManager
  module ToolsAlignments
    module BuildSifts

      include AaDict
      def processSIFTS(hash)
        siftSalida = Hash.new
        # cada entidad es una cadena
        miEntity = []
        if not hash
          return siftSalida
        end
        if not hash["entry"]
          return siftSalida
        end
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

    end
  end
end
