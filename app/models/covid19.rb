class Covid19
  def self.selected_entries
    [
      {
        name: "EMD-30039",
        description: "SARS-CoV-2 Spike Glycoprotein",
        image_url: "https://www.ebi.ac.uk/pdbe/static/entry/EMD-30039/400_30039.gif",
        query_url: "/?queryId=EMD-30039&viewer_type=ngl&button=#query",
      },
      {
        name: "6M17",
        description: "The 2019-nCoV RBD/ACE2-B0AT1 complex",
        image_url: "https://www.ebi.ac.uk/pdbe/static/entry/6m17_deposited_chain_front_image-200x200.png",
        query_url: "/?queryId=6M17&viewer_type=ngl&button=#query",
      },
      {
        name: "6ACG",
        description: "Structure of novel coronavirus spike receptor-binding domain complexed with its receptor ACE2",
        image_url: "https://www.ebi.ac.uk/pdbe/static/entry/6lzg_deposited_chain_front_image-200x200.png",
        query_url: "/?queryId=6LZG&viewer_type=ngl&button=#query",
      },
      {
        name: "EMD-7573",
        description: "SARS Spike Glycoprotein, Stabilized variant, C3 symmetry",
        image_url: "https://www.ebi.ac.uk/pdbe/static/entry/EMD-7573/400_7573.gif",
        query_url: "/?queryId=EMD-7573&viewer_type=ngl&button=#query",
      },
    ]
  end

  def self.get_links(name, style, hash, keys)
    entry = hash.dig(*keys)

    urls = if entry.is_a?(Array)
      entry
    elsif entry.is_a?(Hash)
      entry["links"].try(:values) || []
    else
      []
    end

    urls.map { |url| {name: name, style: style, url: url} }
  end

  def self.proteins
    json_path = File.join(__dir__, "..", "data", "cv-data.json")
    json = JSON.parse(open(json_path).read)
    proteins_json = JSON.parse(open(json_path).read).slice("S") # DEBUG: slice

    proteins_json.map do |name, protein|
      new_protein = protein.map do |key, value|
        case key
        when "names"
          [key.to_sym, value]
        when "PDB"
          new_value = value.map do |pdb_key, pdb_hash|
            {
              name: pdb_key,
              url: "/?queryId=#{pdb_key}&viewer_type=ngl&button=#query",
              image_url: "https://cdn.rcsb.org/images/rutgers/#{pdb_key[1,2]}/#{pdb_key}/#{pdb_key}.pdb1-500.jpg",
              links: [
                *get_links("PDB-Redo", :turq, pdb_hash, ["validation", "pdb-redo"]),
                *get_links("Isolde", :cyan, pdb_hash, ["rebuilt-isolde"]),
              ],
            }
          end
          [:pdb, new_value]
        end
      end.compact.to_h

      {name: name}.merge(new_protein)
    end
  end
end
