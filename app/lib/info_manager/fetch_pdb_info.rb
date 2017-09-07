module InfoManager
  module FetchPdbInfo

    include SourcePdbInfo::FetchPdbAvailty
    def fetchPDBavailty(pdb)
      toReturn = queryPDBavailty(pdb)
      return toReturn
    end

    include SourcePdbInfo::FetchPdbTitle
    def fetchPDBtitle(pdb)
      toReturn = queryPDBtitle(pdb)
      return toReturn
    end

  end
end
