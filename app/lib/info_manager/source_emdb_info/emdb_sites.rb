module InfoManager
  module SourceEmdbInfo
    module EmdbSites
      
      BaseUrl = Settings.GS_BaseUrl#"https//3dbionotes.cnb.csic.es/"
      Server = Settings.GS_PDBeServer#"https://www.ebi.ac.uk/pdbe/api/"
      EmdbMapUrl = Server+"/emdb/entry/map/"
      EmdbSummaryUrl = Server+"/emdb/entry/summary/"

    end
  end
end
