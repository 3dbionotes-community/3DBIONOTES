module ImportProteinsManager
  module ImportProteinsTools

    include InfoManager::SourceUniprotInfo::UniprotSites
    def get_annotations_number(targets)
      uniprot_acc = []
      targets.each do |t|
        uniprot_acc.push(t['acc'])
      end
      data = Net::HTTP.get_response( URI.parse(UniprotURL+"?query="+uniprot_acc.join(",")+"&format=xml") ).body
      begin
        hash = Nori.new(:parser=> :nokogiri, :advanced_typecasting => false).parse(data)
      rescue
        puts "Error downloading and reading xml:\n#{$!}"
      end
      n_annot = {}
      if !hash['uniprot'].nil?
        hash['uniprot']['entry'].each do |e|
          if e['accession'].class == Array
            e['accession'].each do |acc|
              if e['feature'].class == Array
                n_annot[acc] = e['feature'].length
              end
            end
          else
            if e['feature'].class == Array
              n_annot[ e['accession'] ] = e['feature'].length
            end
          end
        end
      end
      out = []
      targets.each do |t|
        x = t
        x['N'] = 0
        if n_annot.key?(t['acc'])
          x['N'] = n_annot[ t['acc'] ]
        end
        out.push(x)
      end
      return out 
    end
  end
end
