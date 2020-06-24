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

  def self.get_pdb_redo_links(title, style, pdb_key, hash, keys)
    entries0 = hash && keys ? (hash.dig(*keys) || []) : []
    entries = entries0.is_a?(Hash) ? [entries0] : entries0

    with_indexes(entries, title).map do |entry, title_indexed|
      name, = entry.values_at("name")
      {
        title: title_indexed,
        name: name,
        style: style,
        query_url: "/?queryId=PDB-REDO-#{pdb_key}&viewer_type=ngl&button=#query",
        external_url: "https://pdb-redo.eu/db/#{name}",
      }
    end
  end

  def self.with_indexes(entries, title)
    append_index = entries.size > 1
    entries.map.with_index(1) { |entry, idx| [entry, append_index ? "#{title} (#{idx})" : title] }
  end

  def self.get_isolde_links(title, style, pdb_key, hash, keys)
    return [] unless hash && keys
    entries = hash.dig(*keys) || []

    with_indexes(entries, title).map do |entry, title_indexed|
      entry_name, uuid = entry.values_at("name", "uuid")
      {
        title: title_indexed,
        name: entry_name,
        style: style,
        query_url: "/?queryId=ISOLDE-#{pdb_key}&uuid=#{uuid}&viewer_type=ngl&button=#query",
      }
    end
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

  def self.to_hash(entries)
    entries.is_a?(Hash) ? entries : entries.map { |key| [key, {}] }.to_h.sort
  end

  def self.parse_pdb(protein, keys)
    entries = protein.dig(*keys) || []
    items = []
    pockets = {}
    to_hash(entries).each do |pdb_key, pdb_hash|
      items.push({
        name: pdb_key,
        description: pdb_hash["description"],
        query_url: "/?queryId=#{pdb_key}&viewer_type=ngl&button=#query",
        image_url: "https://www.ebi.ac.uk/pdbe/static/entry/#{pdb_key}_deposited_chain_front_image-200x200.png",
        external: {text: "EBI", url: "https://www.ebi.ac.uk/pdbe/entry/pdb/#{pdb_key}"},
        api: "https://www.ebi.ac.uk/pdbe/api/pdb/entry/summary/#{pdb_key}",
        type: 'pdb',
        related: get_related_keys(pdb_hash["emdbs"]),
        pockets: pdb_hash.key?("pockets") ? pdb_hash["pockets"].map { |pocket| pocket['id']} : [],
        experiment: keys.last,
        links: [
          *get_pdb_redo_links("PDB-Redo", :turq, pdb_key, pdb_hash, ["validation", "pdb-redo"]),
          *get_isolde_links("Isolde", :cyan, pdb_key, pdb_hash, ["validation", "isolde"]),
        ],
      })

      if pdb_hash.key?("pockets")
        pdb_hash["pockets"].each do |pocket|
          id = pocket['id']
          bindingSiteScore = pocket['bindingSiteScore']
          pockets[id] = bindingSiteScore
        end
      end
    end
    return items.compact, pockets
  end

  def self.parse_emdb(protein, keys)
    entries = protein.dig(*keys) || []
    to_hash(entries).map do |emdb_key, emdb_hash|
      code = emdb_key.split("-")[1]
      {
        name: emdb_key,
        description: emdb_hash["description"],
        query_url: "/?queryId=#{emdb_key}&viewer_type=ngl&button=#query",
        image_url: "https://www.ebi.ac.uk/pdbe/static/entry/#{emdb_key}/400_#{code}.gif",
        related: get_related_keys(emdb_hash["pdbs"] || emdb_hash["pdb"]),
        external: {text: "EBI", url: "https://www.ebi.ac.uk/pdbe/entry/emdb/#{emdb_key}"},
        api: "https://www.ebi.ac.uk/pdbe/api/emdb/entry/summary/#{emdb_key}",
        type: 'emdb',
        links: [],
      }
    end
  end

  def self.parse_swiss_model(protein, keys)
    entries = protein.dig(*keys) || []
    entries.map do |entry|
      project, model, description = entry.values_at("project", "model", "description")
      {
        name: "#{project}-#{model}",
        description: ["project: #{project}", "model: #{model}", description].compact.join(" | "),
        query_url: "/?queryId=SWISSMODEL-#{protein['uniprotAccession'][0]}-#{project}-#{model}&viewer_type=ngl&button=#query",
        image_url: "https://swissmodel.expasy.org/interactive/#{project}/models/#{model}.png",
        external: {text: "SWISS-MODEL", url: "https://swissmodel.expasy.org/interactive/#{project}/models/#{model}"},
        links: [],
      }
    end
  end

  def self.parse_alphafold(protein, keys)
    entries = protein.dig(*keys) || []
    entries.map do |entry|
      name, uuid, description = entry.values_at("name", "uuid", "description")
      {
        name: name,
        description: description,
        links: [],
      }
    end
  end

  def self.parse_bsm_arc(protein, keys)
    entries = protein.dig(*keys) || []
    entries.map do |entry|
      model, = entry.values_at("model")
      {
        name: "#{model}",
        links: [],
      }
    end
  end

  def self.parse_db_with_experiments(protein, keys)
    entries = protein.dig(*keys) || []

    experiments = []
    items = []
    pockets = {}

    entries.each do |key,value|
      if key == 'EMDB'
        items = items + parse_emdb(protein, [*keys, "EMDB"])
      else
        new_items, pdb_pockets = parse_pdb(protein, [*keys, key])
        items = items + new_items
        experiments.push(key)
        pockets.merge!(pdb_pockets)
      end
    end
    print("pockets_final")
    print(pockets)
    return items, experiments, pockets
    
  end

  def self.parse_db(protein, keys)
    parse_pdb(protein, [*keys, "PDB"]) + parse_emdb(protein, [*keys, "EMDB"])
  end

  def self.load_data
    json_path = File.join(__dir__, "../data/cv-data.json")
    data = JSON.parse(open(json_path).read)
    get_proteins_data(data["SARS-CoV-2 Proteome"])
  end

  def self.card(name, items, experiments = [], pockets = [])
    items.present? ? {name: name, items: items, experiments: experiments, pockets: pockets, subsections: []} : nil
  end

  def self.card_wrapper(name, subsections)
    subsections2 = subsections.compact.map { |subsection| subsection.merge(parent: name) }
    subsections2.size > 0 ? {name: name, items: [], experiments: [], pockets: [], subsections: subsections2} : nil
  end

  def self.get_relations(proteins)
    items = {}
    relations_base = proteins.each do |protein|
      protein[:sections].each do |section|
        section[:items].each do |item|
           items[item[:name]] = {protein: protein[:name], experiment: item[:experiment], pockets: item[:pockets]}
        end
        subsection_items = section[:subsections].flat_map do |subsection|
          subsection[:items].each do |item|
            items[item[:name]] = {protein: protein[:name], experiment: item[:experiment], pockets: item[:pockets]}
          end
        end
      end
    end

    return items
  end

  def self.get_proteins_data(proteins_raw)
    proteins = proteins_raw.map do |name, protein|
      {
        name: name,
        names: protein["names"],
        description: protein["description"],
        polyproteins: protein["uniprotAccession"],
        sections: [
          card("PDB", *parse_pdb(protein, ["PDB"])),
          card("EMDB", parse_emdb(protein, ["EMDB"])),
          card_wrapper("Interactions", [
            card("P-P Interactions", *parse_db_with_experiments(protein, ["Interactions", "P-P-Interactions"])),
            card("Ligands", *parse_db_with_experiments(protein, ["Interactions", "Ligands"])),
          ]),
          card_wrapper("Related", [
            card("SARS-CoV", *parse_db_with_experiments(protein, ["Related", "SARS-CoV"])),
            card("Other", *parse_db_with_experiments(protein, ["Related", "OtherRelated"]))
          ]),
          card_wrapper("Computational Models", [
            card("Swiss Model", parse_swiss_model(protein, ["CompModels", "swiss-model"])),
            card("AlphaFold", parse_alphafold(protein, ["CompModels", "AlphaFold"])),
            card("BSM-Arc", parse_bsm_arc(protein, ["CompModels", "BSM-Arc"])),
          ]),

        ].compact,
      }
    end

    {proteins: proteins, relations: get_relations(proteins)}
  end
end
