module AlignmentsEnsemblManager
  module ToolsEnsembl
    module BuildEnsemblAlignment

      include AlignmentsEnsemblManager::SourceEnsembl::SourceLookup
      include AlignmentsEnsemblManager::SourceEnsembl::SourceSequence
      include BuildExonCds
      include BuildUniprotSeq
      include BuildGeneAaAlignment

      def buildENSEMBLalignment(ensembl_gene_id,ensembl_transcript_id,uniprot_acc=nil)
        transcripts = buildExonCDS( ensembl_gene_id, ensembl_transcript_id, uniprot_acc )
        gene = sourceLookUp( ensembl_gene_id )
        _sequence = sourceSequence( ensembl_gene_id )
        gene['seq'] = _sequence['seq']
        gene['uniprot_seq'] = buildUniProtSeq(transcripts)
        transcripts = buildGeneAAalignment( gene,transcripts )
        return {'gene'=>gene,'transcripts'=>transcripts}
      end

    end 
  end
end
