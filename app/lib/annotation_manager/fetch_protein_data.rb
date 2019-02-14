module AnnotationManager
  module FetchProteinData

    include SourceProteinData::SourceBiomuta
    def fetchBiomutaFromUniprot(uniprotAc)
      toReturn = sourceBiomutaFromUniprot(uniprotAc)
      return toReturn
    end

    include SourceProteinData::SourcePhosphosite
    def fetchPhosphositeFromUniprot(uniprotAc)
      toReturn = sourcePhosphositeFromUniprot(uniprotAc)
      return toReturn 
    end

    include SourceProteinData::SourceDbptm
    def fetchDbptmFromUniprot(uniprotAc)
      toReturn = sourceDbptmFromUniprot(uniprotAc)
      return toReturn
    end

    include SourceProteinData::SourceIedb
    def fetchIEDBfromUniprot(uniprotAc)
      toReturn = sourceIedbFromUniprot(uniprotAc)
      return toReturn
    end

    include SourceProteinData::SourceDsysmap
    def fetchDsysmapFromUniprot(uniprotAc)
      toReturn = sourceDsysmapFromUniprot(uniprotAc)
      return toReturn
    end

    include SourceProteinData::SourceSwissvar
    def fetchSwissvarFromUniprot(uniprotAc)
      toReturn = sourceSwissvarFromUniprot(uniprotAc)
      return toReturn
    end

    include SourceProteinData::SourceElmdb
    def fetchElmdbFromUniprot(uniprotAc)
      toReturn = sourceElmdbFromUniprot(uniprotAc)
      return toReturn
    end

    include SourceProteinData::SourcePfam
    def fetchPfamFromUniprot(uniprotAc)
      toReturn = sourcePfamFromUniprot(uniprotAc)
      return toReturn
    end

    include SourceProteinData::SourceMobi
    def fetchMobiFromUniprot(uniprotAc)
      toReturn = sourceMobiFromUniprot(uniprotAc)
      return toReturn
    end

    include SourceProteinData::SourceSmart
    def fetchSmartFromUniprot(uniprotAc)
      toReturn = sourceSmartFromUniprot(uniprotAc)
      return toReturn
    end

    include SourceProteinData::SourceInterpro
    def fetchInterproFromUniprot(uniprotAc)
      toReturn = sourceInterproFromUniprot(uniprotAc)
      return toReturn
    end

    include SourceProteinData::SourcePdbRedo
    def fetchPDB_REDO(pdbId)
      toReturn = sourcePDB_REDO(pdbId)
      return toReturn
    end

  end
end
