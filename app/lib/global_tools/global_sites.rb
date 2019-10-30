module GlobalTools
  module GlobalSites

    GS_BaseUrl = "https://bionotes-service.cnb.csic.es/"
    GS_EnsemblServer = "http://rest.ensembl.org/"
    GS_UniServer = "http://www.uniprot.org/"
    GS_SIFTSUrl = "http://ftp.ebi.ac.uk/pub/databases/msd/sifts/xml/"
    GS_PDBeServer = "https://www.ebi.ac.uk/pdbe/api/"
    GS_InterproURL = "http://www.ebi.ac.uk/interpro/protein/"
    GS_DsysmapURL = "https://dsysmap.irbbarcelona.org/api/getMutationsForProteins?protein_ids="
    GS_MobiURL = "http://mobidb.bio.unipd.it/ws/entries/"
    GS_PfamURL = "http://pfam.xfam.org/"
    GS_SmartURL = "http://smart.embl.de/smart/batch.pl?TEXTONLY=1&INCLUDE_SIGNALP=1&IDS="

    GS_LocalApp = "/services/bionotes/apps/bionotes/"
    GS_LocalAppDB = GS_LocalApp+"/db/"
    GS_LocalUpload = "/services/bionotes/apps/bionotes/public/upload/"
    GS_LocalSeq = "/services/bionotes/apps/bionotes/data/tmp_seq/"
    GS_LocalSIFTS =  "/services/bionotes/databases/SIFTS/XML/"
    GS_LocalScripts = "/services/bionotes/apps/bionotes/scripts/"
    GS_LocalMolProobity_tmp = "/services/bionotes/apps/bionotes/data/tmp_mp/"
    GS_LocalDB = "/services/bionotes/databases/"

    GS_IdentityMatrixFile = "/services/bionotes/apps/ENSEMBL/IDENTITY"  
    GS_ElmScript = "/services/bionotes/apps/ELMDB/get_elm_data"
    

  end
end
