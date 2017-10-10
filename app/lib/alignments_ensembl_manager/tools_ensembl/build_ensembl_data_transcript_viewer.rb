module AlignmentsEnsemblManager
  module ToolsEnsembl
    module BuildEnsemblDataTranscriptViewer

      include AlignmentsEnsemblManager::ToolsEnsembl::BuildEnsemblAlignment
      def buildENSEMBLdataTranscriptViewer(ensembl_gene_id,ensembl_transcript_id,uniprot_acc=nil)
        gene = buildENSEMBLalignment(ensembl_gene_id,ensembl_transcript_id,uniprot_acc)
        transcript = gene['transcripts'][ ensembl_transcript_id ]
        aa_seq = transcript['aa_seq'].split(//)
        aa_seq.unshift("*")
        transcript_peptide_seq = "";
        last_e = {}
        transcript['exon'].each do |e|
          if not e.key?('cds_phase')
            last_e = e
            next
          end
          phase = Integer(e['cds_phase'])
          if phase >= 1
            phase = 1+0.5*(1-gene['gene']['strand'])
          else 
            phase = 0
          end
      
          if last_e.key?('cds_end') and e.key?('cds_start')
            __n = 0.5*(1+gene['gene']['strand'])*(e['cds_start']-last_e['cds_end']-phase)+0.5*(1-gene['gene']['strand'])*(last_e['cds_start']-e['cds_end'])
            transcript_peptide_seq += " "*(Integer(__n)-phase)
          elsif e.key?('cds_start')
            __n = 0.5*(1+gene['gene']['strand'])*(e['cds_start']-gene['gene']['start'])+0.5*(1-gene['gene']['strand'])*(gene['gene']['end']-e['cds_end'])
            transcript_peptide_seq += " "*(Integer(__n))
          else
            last_e = e
            next
          end
          gap = ""
          if not Integer(e[ 'cds_phase' ]) > 0
            gap = " "
          end
          transcript_peptide_seq += gap+aa_seq[e['aa_start']..e['aa_end']].join("  ")
          last_e = e
        end
        transcript_peptide_seq += " "*(gene['gene']['seq'].length-transcript_peptide_seq.length)
        if gene['gene']['strand'] < 0
          gene['gene']['neg_seq']=gene['gene']['seq'].reverse
          gene['gene']['pos_seq']=Bio::Sequence.auto( gene['gene']['neg_seq'] ).reverse_complement.to_s.reverse.upcase
          transcript_peptide_seq = transcript_peptide_seq.reverse
        else
          gene['gene']['pos_seq'] = gene['gene']['seq']
          gene['gene']['neg_seq']=Bio::Sequence.auto( gene['gene']['pos_seq'] ).reverse_complement.to_s.reverse.upcase
        end
        return {'transcript'=>transcript,'gene'=>gene['gene'],'aa_seq'=>transcript_peptide_seq}
      end

    end 
  end
end
