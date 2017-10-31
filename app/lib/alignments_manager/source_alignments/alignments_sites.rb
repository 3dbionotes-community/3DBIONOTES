module AlignmentsManager
  module SourceAlignments
    module AlignmentsSites

      include GlobalTools::GlobalSites

      SIFTSUrl = GS_SIFTSUrl#"http://ftp.ebi.ac.uk/pub/databases/msd/sifts/xml/"
      SIFTSFile =  GS_LocalSIFTS#"/home/joan/databases/SIFTS/XML/"
      UniprotURL = GS_UniServer+"uniprot/"#"http://www.uniprot.org/uniprot/"
      LocalPath =  GS_LocalUpload#"/home/joan/apps/bionotes/public/upload/"
    end
  end
end
