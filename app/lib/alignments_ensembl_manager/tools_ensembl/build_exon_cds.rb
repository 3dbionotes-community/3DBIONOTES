module AlignmentsEnsemblManager
  module ToolsEnsembl
    module BuildExonCds

      include AlignmentsEnsemblManager::SourceEnsembl::SourceUniprotRef
      include AlignmentsEnsemblManager::SourceEnsembl::SourceExonCds
      include AlignmentsEnsemblManager::SourceEnsembl::SourceSequence
      include AlignmentsEnsemblManager::SourceEnsembl::SourceTranslateExon
 
      def buildExonCDS(gene_id,transcript_id,uniprot_acc=nil)
        req = sourceExonCDS(gene_id)
        out = Hash.new
        req.each do |i|
          if i['Parent'] == transcript_id
            if not out.key?(i['Parent'])
              out[ i['Parent'] ] = {'cds'=>[],'exon'=>[]}
            end
            if not out[ i['Parent'] ].key?('protein_id') and i.key?('protein_id')
              out[ i['Parent'] ][ 'protein_id' ] = i['protein_id']
              _aa_sequence = sourceSequence( i['protein_id'] )
              out[ i['Parent'] ]['aa_seq'] = _aa_sequence['seq']
              _trans_exons = sourceTranslateExon( i['protein_id'] )
              out[ i['Parent'] ]['translation_exons'] = _trans_exons
              if uniprot_acc
                _uniprot_ref = {'Uniprot/SPTREMBL'=>[uniprot_acc]}
              else
                _uniprot_ref = sourceUniprotRef( i['Parent'] )
              end
              out[ i['Parent'] ]['uniprot_ref'] = _uniprot_ref
            end
            out[ i['Parent'] ][ i['feature_type'] ].push(i)
          end
        end
        out = merge_exon_info(out)
        return out
      end

      def merge_exon_info(info)
        out = Hash.new
        info.each do |k,v|
          out[k] = Hash.new
          v.each do |i,j|
            out[k][i] = j
          end
          _exons = []
          if v.key?('protein_id')
            if v['cds'].length != v['translation_exons'].length
              abort("FATAL ERROR")
            end
            out[k]['exon'].each do |e|
              if( Integer(e['ensembl_end_phase'])>-1 || Integer(e['ensembl_phase'])>-1)
                _cds = v['cds'].shift
                _te = v['translation_exons'].shift
                e['cds_start'] = _cds['start']
                e['cds_end'] = _cds['end']
                e['cds_phase'] = _cds['phase']
                e['aa_start'] = _te['start']
                e['aa_end'] = _te['end']
              end
              _exons.push(e)
            end
            out[k]['exon'] = _exons
          end
        end
        return out
      end

    end 
  end
end
