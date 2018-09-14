module AlignmentsManager
  module SourceAlignments
    module SourcePdbCoverage

      include GlobalTools::FetchParserTools
      include AlignmentsSites
      include AlignmentsManager::ToolsAlignments::BuildSifts
      include AlignmentsManager::ToolsAlignments::BuildPdbInfo

      def sourcePDBcoverage(pdbId_ch)
        info = nil
        pdbId = ''
        ch = ''

        if pdbId_ch.length < 20
          pdbId = pdbId_ch[0,4]#pdbId_ch.chop()
          ch = pdbId_ch[4,pdbId_ch.length]
          dbData = PdbDatum.find_by(pdbId: pdbId)
          if !dbData.nil? 
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
            sifts = processSIFTS(dataXml)
            info = pdbInfo(sifts)
            if !dbData.nil?
              dbData.destroy
            end
            PdbDatum.create(pdbId: pdbId, digest: digest, data: info.to_json)
          end
        elsif pdbId_ch =~ /interactome3d/ then
          rand, pdbId, ch = pdbId_ch.split("::")
          pdbId.gsub! '_dot_','.'
          dbData = Interactome3dDatum.find_by(pdbId: pdbId) 
          info = JSON.parse(dbData.data)
        else
          rand, pdb, ch = pdbId_ch.split("::")
          info = JSON.parse(File.read(LocalPath+"/"+rand+"/alignment.json"))
          info  = info[pdb.gsub! '_dot_','.']
        end

        __map = Array.new
        info[ch].each do |uniprot,mapping|
          __map = mapping["mapping"]
        end

        coverage = Array.new
        __e = {"start"=>-1,"end"=>-1}
        __n = 1
        __map.each do |i|
          if i.has_key?("pdbIndex")
            if __e["start"]<0
              __e = {"start"=>__n,"end"=>-1}
            end
          else
            if __e["start"]>0
              __e["end"] = __n-1
              coverage.push(__e)
              __e = {"start"=>-1,"end"=>-1}
            end
          end
          __n += 1
        end
        if __e["start"]>0 &&  __e["end"]<0
          __e["end"] = __n-1
          coverage.push(__e)
        end
        return { "Structure coverage"=>coverage }
      end

    end
  end
end
