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
        dbData = Dsysmapentry.find_by(proteinId: uniprotAc)
        info = []
        if dbData.nil?
          url = DsysmapURL + uniprotAc
          rawData = getUrl(url)
          hashData = getXml(rawData)
          info = fetchDsysmapAnnots(hashData)
          if info.length  > 0
            Dsysmapentry.create(proteinId: uniprotAc, data: info.to_json)
          end
        else
          info = JSON.parse(dbData.data)
        end
        return info
      end

    end 
  end
end
