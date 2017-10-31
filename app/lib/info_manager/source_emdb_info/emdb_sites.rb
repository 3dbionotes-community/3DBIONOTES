module InfoManager
  module SourceEmdbInfo
    module EmdbSites
      
      include GlobalTools::GlobalSites

      BaseUrl = GS_BaseUrl#"http://3dbionotes.cnb.csic.es/"
      Server = GS_PDBeServer#"https://www.ebi.ac.uk/pdbe/api/"
      EmdbMapUrl = Server+"/emdb/entry/map/"
      EmdbSummaryUrl = Server+"/emdb/entry/summary/"
    end
  end
end
