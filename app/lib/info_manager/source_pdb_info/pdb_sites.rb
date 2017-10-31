module InfoManager
  module SourcePdbInfo
    module PdbSites

      include GlobalTools::GlobalSites

      BaseUrl = GS_BaseUrl#"http://3dbionotes.cnb.csic.es/"
      Server = GS_PDBeServer#"https://www.ebi.ac.uk/pdbe/api/"
      PdbSummaryUrl = Server+"/pdb/entry/summary/"
    end
  end
end
