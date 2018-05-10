module CollectorManager
  module CollectProteinData

    include ProteinDataCollectors::CollectPtmData
    def  collectPTMdataFromUniprot(acc)
      return _collectPTMdataFromUniprot(acc)
    end

    include ProteinDataCollectors::CollectVariantData
    def  collectVariantDataFromUniprot(acc)
      return _collectVariantDataFromUniprot(acc)
    end

    include ProteinDataCollectors::CollectPfamData
    def  collectPfamDataFromUniprot(acc)
      return _collectPfamDataFromUniprot(acc)
    end

    include ProteinDataCollectors::CollectInterProData
    def  collectInterProDataFromUniprot(acc)
      return _collectInterProDataFromUniprot(acc)
    end

    include ProteinDataCollectors::CollectSmartData
    def  collectSmartDataFromUniprot(acc)
      return _collectSmartDataFromUniprot(acc)
    end

    include ProteinDataCollectors::CollectEpitopesData
    def  collectEpitopesDataFromUniprot(acc)
      return _collectEpitopesDataFromUniprot(acc)
    end

    include ProteinDataCollectors::CollectElmData
    def  collectElmDataFromUniprot(acc)
      return _collectElmDataFromUniprot(acc)
    end

  end
end
