module InfoManager
  module SourceEmdbInfo
    module EmdbSites
      
      BaseUrl = Settings.GS_BaseUrl#"https//3dbionotes.cnb.csic.es/"
      # Server = Settings.GS_PDBeServer#"https://www.ebi.ac.uk/pdbe/api/"
      Server = "https://www.ebi.ac.uk/emdb/api/"
      EmdbMapUrl = Server+"entry/"
      EmdbSummaryUrl = Server+"entry/"

    end
  end
end
