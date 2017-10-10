module AlignmentsManager
  module BuildAlignments
    
    include SourceAlignments::SourcePdbAlignment
    def fetchPDBalignment(pdbId)
      return sourcePDBalignment(pdbId)
    end

    include SourceAlignments::SourcePdbCoverage
    def fetchPDBcoverage(pdbId_ch)
      return sourcePDBcoverage(pdbId_ch)
    end
  end
end
