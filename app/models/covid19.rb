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

  def self.pdb_base(pdb_key)
    short_code = pdb_key[1, 2]
    {
      name: pdb_key,
      url: "/?queryId=#{pdb_key}&viewer_type=ngl&button=#query",
      image_url: "https://cdn.rcsb.org/images/rutgers/#{short_code}/#{pdb_key}/#{pdb_key}.pdb1-500.jpg",
      external_link: "https://www.rcsb.org/structure/#{pdb_key}",
      related: [],
      links: [],
    }
  end

  def self.parse_pdb(protein, keys)
    entries = protein.dig(*keys) || []
    entries.map do |pdb_key, pdb_hash|
      {
        **pdb_base(pdb_key),
        related: pdb_hash["emdbs"] || [],
        links: [
          *get_links("PDB-Redo", :turq, pdb_hash, ["validation", "pdb-redo"]),
          *get_links("Isolde", :cyan, pdb_hash, ["rebuilt-isolde"]),
        ],
      }
    end
  end

  def self.parse_emdb(protein, keys)
    entries = protein.dig(*keys) || []
    entries.map do |emdb_key, emdb_value|
      code = emdb_key.split("-")[1]
      {
        name: emdb_key,
        url: "/?queryId=#{emdb_key}&viewer_type=ngl&button=#query",
        image_url: "https://www.ebi.ac.uk/pdbe/static/entry/#{emdb_key}/400_#{code}.gif",
        related: emdb_value["pdbs"] || [],
        external_link: "https://www.ebi.ac.uk/pdbe/entry/emdb/#{emdb_key}",
        links: [],
      }
    end
  end

  def self.load_data
    json_path = File.join(__dir__, "../data/cv-data.json")
    JSON.parse(open(json_path).read)
  end

  def self.proteins_data
    data = DATA
    proteins_raw = data.select { |key, value| value.has_key?("PDB") }.slice("S")
    groups = data.select { |key, value| value.has_key?("proteins") }

    proteins_by_group = groups
      .map { |key, value| [key, value["proteins"]] }
      .to_h
    group_by_protein = proteins_by_group.flat_map do |group_key, protein_names|
      protein_names.map { |protein_name| [protein_name, group_key] }
    end.to_h

    proteins = proteins_raw.map do |name, protein|
      other_related = protein.dig("Related", "OtherRelated") || []
      other_related_items = other_related.map { |pdb_key| pdb_base(pdb_key) }
      {
        name: name,
        names: protein["names"],
        group: group_by_protein[name],
        sections: [
          {name: "PDB", items: parse_pdb(protein, ["PDB"])},
          {name: "EMDB", items: parse_emdb(protein, ["EMDB"])},
          {name: "Interactions", subsections: [
            {name: "PPComplex", items: parse_pdb(protein, ["Interactions", "PPComplex"])},
            {name: "Ligands", items: parse_pdb(protein, ["Interactions", "Ligands"])}
          ]},
          {name: "Related", subsections: [
            {name: "SARS-CoV", items: parse_pdb(protein, ["Related", "SARS-CoV"])},
            {name: "Other", items: other_related_items},
          ]},
        ],
      }
    end

    {proteins: proteins, relations: []}
  end

  DATA = self.load_data
end
