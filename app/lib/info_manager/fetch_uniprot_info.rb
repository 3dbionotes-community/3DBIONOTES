module InfoManager
  module FetchUniprotInfo

    include SourceUniprotInfo::FetchUniprotSequence
    def fetchUNIPROTsequence(acc)
      toReturn = queryUNIPROTsequence(acc)
      return toReturn
    end

    include SourceUniprotInfo::FetchUniprotTitle
    def fetchUNIPROTtitle(acc)
      toReturn = queryUNIPROTtitle(acc)
      return toReturn
    end

  end
end
