module InfoManager
  module FetchEmdbInfo

    include SourceEmdbInfo::FetchEmdbSize
    def fetchEMDBsize(emdbId)
      toReturn = queryEMDBsize(emdbId)
      return toReturn
    end

    include SourceEmdbInfo::FetchEmdbTitle
    def fetchEMDBtitle(emdbId)
      toReturn = queryEMDBtitle(emdbId)
      return toReturn
    end

    include SourceEmdbInfo::FetchEmdbThr
    def fetchEMDBthr(emdbId)
      toReturn = queryEMDBthr(emdbId)
      return toReturn
    end

    include SourceEmdbInfo::FetchEmdbAvailty
    def fetchEMDBavailty(emdbId)
      toReturn = queryEMDBavailty(emdbId)
      return toReturn
    end

  end
end
