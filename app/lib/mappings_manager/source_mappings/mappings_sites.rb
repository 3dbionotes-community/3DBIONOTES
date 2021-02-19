module MappingsManager
  module SourceMappings
    module MappingsSites

      Server = Settings.GS_PDBeServer#"https://www.ebi.ac.uk/pdbe/api/"
      EmdbFit = "emdb/entry/fitted/"
      PDBSumary = "pdb/entry/summary/"
      SIFTSPDB = "mappings/best_structures/"
      SIFTSUniprot = "mappings/uniprot/"
      UniprotURL = Settings.GS_UniServer+"uniprot/"#"http://www.uniprot.org/uniprot/"

    end
  end
end
