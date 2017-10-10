module AlignmentsManager
  module SourceAlignments
    module SourcePdbAlignment

      include GlobalTools::FetchParserTools
      include AlignmentsSites
      include AlignmentsManager::ToolsAlignments::BuildSifts
      include AlignmentsManager::ToolsAlignments::BuildPdbInfo

      def sourcePDBalignment(pdbId)
        info = nil
        if pdbId =~ /[A-Z]{20}/
          info = File.read(LocalPath+"/"+pdbId+"/alignment.json")
        else
          dbData = PdbDatum.find_by(pdbId: pdbId)
          if !dbData.nil? 
            # lo que buscamos es lo que esta guardado
            info = JSON.parse(dbData.data)
          else
            file = SIFTSFile+pdbId.downcase[1..2]+"/"+pdbId.downcase+".xml.gz"
            rawData = getFileWithDigest(file)
            if rawData["data"] == nil
              url = SIFTSUrl+pdbId+".xml.gz"
              rawData = getUrlWithDigest(url)
            end
            digest = rawData["checksum"]
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
        end
        return info
      end

    end
  end
end
