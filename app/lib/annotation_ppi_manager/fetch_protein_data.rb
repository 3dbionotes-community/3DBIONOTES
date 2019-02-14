module AnnotationPpiManager
  module FetchProteinData

    include SourceProteinData::SourceComplexVariants
    def fetchComplexVariants(pdbId,path=nil,annotations=nil)
      toReturn = sourceComplexVariants(pdbId,path=path,annotations=annotations)
      return toReturn
    end

    include SourceProteinData::SourceComplexPtms
    def fetchComplexPTMs(pdbId,path=nil)
      toReturn = sourceComplexPtms(pdbId,path=path)
      return toReturn
    end

    include SourceProteinData::SourceComplexPfam
    def fetchComplexPfam(pdbId,path=nil)
      toReturn = sourceComplexPfam(pdbId,path=path)
      return toReturn
    end

    include SourceProteinData::SourceComplexInterPro
    def fetchComplexInterPro(pdbId,path=nil)
      toReturn = sourceComplexInterPro(pdbId,path=path)
      return toReturn
    end

    include SourceProteinData::SourceComplexSmart
    def fetchComplexSmart(pdbId,path=nil)
      toReturn = sourceComplexSmart(pdbId,path=path)
      return toReturn
    end

    include SourceProteinData::SourceComplexEpitopes
    def fetchComplexEpitopes(pdbId,path=nil)
      toReturn = sourceComplexEpitopes(pdbId,path=path)
      return toReturn
    end

    include SourceProteinData::SourceComplexElm
    def fetchComplexELM(pdbId,path=nil)
      toReturn = sourceComplexELM(pdbId,path=path)
      return toReturn
    end

    include SourceProteinData::SourceComplexCustomData
    def fetchComplexCustomData(pdbId,path,annotations)
      toReturn = sourceComplexCustomData(pdbId,path,annotations)
      return toReturn
    end

  end
end
