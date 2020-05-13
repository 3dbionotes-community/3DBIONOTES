class Covid19
  def self.selected_entries
    [
      {
        name: "EMD-21375",
        description: "Prefusion 2019-nCoV spike glycoprotein with a single receptor-binding domain up (EMD-21375)",
        image_url: "https://www.ebi.ac.uk/pdbe/static/entry/EMD-21375/400_21375.gif",
        query_url: "/?queryId=EMD-21375&viewer_type=ngl&button=#query",
      },
      {
        name: "EMD-30210",
        description: "The nsp12-nsp7-nsp8 complex bound to the template-primer RNA and triphosphate form of Remdesivir(RTP) (EMD-30210)",
        image_url: "https://www.ebi.ac.uk/pdbe/static/entry/EMD-30210/400_30210.gif",
        query_url: "/?queryId=EMD-30210&viewer_type=ngl&button=#query",
      },
      {
        name: "6LZG",
        description: "Structure of novel coronavirus spike receptor-binding domain complexed with its receptor ACE2",
        image_url: "https://www.ebi.ac.uk/pdbe/static/entry/6lzg_deposited_chain_front_image-200x200.png",
        query_url: "/?queryId=6LZG&viewer_type=ngl&button=#query",
      },
      {
        name: "6W9C",
        description: "The crystal structure of papain-like protease of SARS CoV-2",
        image_url: "https://www.ebi.ac.uk/pdbe/static/entry/6w9c_deposited_chain_front_image-200x200.png",
        query_url: "/?queryId=6W9C&viewer_type=ngl&button=#query",
      },
    ]
  end

  def self.proteins_data
    load_data
  end

  private

  def self.get_links(name, style, hash, keys)
    entry = hash.dig(*keys)

    urls = if entry.is_a?(Array)
      entry
    elsif entry.is_a?(Hash) && entry["links"].is_a?(Hash) && (ext_link = entry.dig("links", "ext_link"))
      [ext_link]
    else
      []
    end

    urls.map { |url| {name: name, style: style, url: url} }
  end

  def self.pdb_base(pdb_key)
    {
      name: pdb_key,
      url: "/?queryId=#{pdb_key}&viewer_type=ngl&button=#query",
      image_url: "https://www.ebi.ac.uk/pdbe/static/entry/#{pdb_key}_deposited_chain_front_image-200x200.png",
      external_link: "https://www.ebi.ac.uk/pdbe/entry/pdb/#{pdb_key}",
      related: [],
      links: [],
    }
  end

  def self.get_related_keys(data)
    case
    when data.is_a?(Array)
      data
    when data.is_a?(Hash)
      data.keys
    else
      []
    end
  end

  def self.parse_pdb(protein, keys)
    entries = protein.dig(*keys) || []
    entries.sort.map do |pdb_key, pdb_hash|
      return if pdb_hash.blank?
      {
        **pdb_base(pdb_key),
        related: get_related_keys(pdb_hash["emdbs"]),
        links: [
          *get_links("PDB-Redo", :turq, pdb_hash, ["validation", "pdb-redo"]),
          *get_links("Isolde", :cyan, pdb_hash, ["rebuilt-isolde"]),
        ],
      }
    end.compact
  end

  def self.parse_emdb(protein, keys)
    entries = protein.dig(*keys) || []
    entries.sort.map do |emdb_key, emdb_value|
      code = emdb_key.split("-")[1]
      {
        name: emdb_key,
        url: "/?queryId=#{emdb_key}&viewer_type=ngl&button=#query",
        image_url: "https://www.ebi.ac.uk/pdbe/static/entry/#{emdb_key}/400_#{code}.gif",
        related: get_related_keys(emdb_value["pdbs"]),
        external_link: "https://www.ebi.ac.uk/pdbe/entry/emdb/#{emdb_key}",
        links: [],
      }
    end
  end

  def self.load_data
    json_path = File.join(__dir__, "../data/cv-data.json")
    data = JSON.parse(open(json_path).read)

    proteins_raw = data.select { |key, value| value.has_key?("PDB") }
    polyproteins = data.select { |key, value| value.has_key?("proteins") }

    polyproteins_by_protein = polyproteins
      .flat_map { |name, polyprotein| polyprotein["proteins"].map { |protein| [protein, name] } }
      .group_by(&:first)
      .transform_values { |xs| xs.map(&:second) }

    get_proteins_data(proteins_raw, polyproteins_by_protein)
  end

  def self.card(name, items)
    items.present? ? {name: name, items: items, subsections: []} : nil
  end

  def self.card_wrapper(name, subsections)
    subsections2 = subsections.compact.map { |subsection| subsection.merge(parent: name) }
    subsections2.size > 0 ? {name: name, items: [], subsections: subsections2} : nil
  end

  def self.get_related_items(protein)
    other_related = protein.dig("Related", "OtherRelated") || []
    other_related.uniq.map { |pdb_key| pdb_base(pdb_key) }
  end

  def self.get_relations(proteins)
    relations_base = proteins.flat_map do |protein|
      protein[:sections].flat_map do |section|
        items = section[:items].map { |item| [item[:name], protein[:name]] }
        subsection_items = section[:subsections].flat_map do |subsection|
          subsection[:items].map { |item| [item[:name], protein[:name]] }
        end
        items + subsection_items
      end
    end

    relations_base.group_by { |k, v| k }.transform_values { |vs| vs.map(&:second).uniq }
  end

  def self.get_proteins_data(proteins_raw, polyproteins_by_protein)
    proteins = proteins_raw.map do |name, protein|
      {
        name: name,
        names: protein["names"],
        polyproteins: polyproteins_by_protein[name],
        sections: [
          card("PDB", parse_pdb(protein, ["PDB"])),
          card("EMDB", parse_emdb(protein, ["EMDB"])),
          card_wrapper("Interactions", [
            card("PPComplex", parse_pdb(protein, ["Interactions", "PPComplex"])),
            card("Ligands", parse_pdb(protein, ["Interactions", "Ligands"])),
          ]),
          card_wrapper("Related", [
            card("SARS-CoV", parse_pdb(protein, ["Related", "SARS-CoV"])),
            card("Other", get_related_items(protein)),
          ]),
        ].compact,
      }
    end

    {proteins: proteins, relations: get_relations(proteins)}
  end
end
