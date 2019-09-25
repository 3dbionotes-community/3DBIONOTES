module InfoManager
  module SourcePdbInfo
    module PdbSites

      BaseUrl = Settings.GS_BaseUrl#"https://3dbionotes.cnb.csic.es/"
      Server = Settings.GS_PDBeServer#"https://www.ebi.ac.uk/pdbe/api/"
      PdbSummaryUrl = Server+"/pdb/entry/summary/"

    end
  end
end
