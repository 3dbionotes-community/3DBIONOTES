module AnnotationManager
  module SourceProteinData
    module SourceDsysmap 

      include GlobalTools::FetchParserTools
      DsysmapURL = "https://dsysmap.irbbarcelona.org/api/getMutationsForProteins?protein_ids="

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

      def sourceDsysmapFromUniprot(uniprotAc)
        source = "dsysmap"
        url = DsysmapURL + uniprotAc
        rawData = getUrlWithDigest(url)
        digest = rawData["checksum"]
        dbData = Annotation.find_by(proteinId: uniprotAc,source: source)
        if !dbData.nil? and (dbData.digest == digest)
          info = JSON.parse(dbData.data)
        else
          puts( rawData["data"] )
          hashData = getXml(rawData["data"])
          puts(hashData)
          info = fetchDsysmapAnnots(hashData)
          if !dbData.nil?
            dbData.destroy
          end
          Annotation.create(proteinId: uniprotAc, source: source, digest: digest, data: info.to_json)
        end
        return info
      end

    end 
  end
end
