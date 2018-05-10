module AlignmentsManager
  module ToolsAlignments
    module BuildPdbInfo

      include ProteinManager::FetchSequenceInfo

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
            info[chain][uni]["inverse"] = Hash.new
            fastaUniprot = fetchUniprotSequence(uni)
            info[chain][uni]["uniprotSeq"] = fastaUniprot.seq
            (0..(fastaUniprot.length-1)).to_a.each do |ind|
              info[chain][uni]["mapping"][ind] = Hash.new
            end
            info[chain][uni]["pdbSeq"] = "-" * fastaUniprot.length
            # itero por elementos con correspondencia de indices
            mappings.each do |uniIndex,tupla|
              if (uniIndex.to_i-1) < fastaUniprot.length then
                pdbIndex = tupla["pos"]
                pdbRes = tupla["residue"]
                if info[chain][uni]["mapping"][uniIndex.to_i-1].nil?
                  info[chain][uni]["mapping"][uniIndex.to_i-1] = Hash.new
                end
                info[chain][uni]["mapping"][uniIndex.to_i-1]["pdbIndex"] = pdbIndex.to_i
                info[chain][uni]["inverse"][pdbIndex.to_i]=uniIndex.to_i
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
        end
        return info
      end

    end
  end
end
