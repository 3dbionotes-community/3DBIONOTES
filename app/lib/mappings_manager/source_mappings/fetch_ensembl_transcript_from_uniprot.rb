module MappingsManager
  module SourceMappings
    module FetchEnsemblTranscriptFromUniprot

      include GlobalTools::FetchParserTools
      include MappingsSites
      include AlignmentsEnsemblManager::SourceEnsembl::SourceLookup
 
      def queryENSEMBLtranscriptFromUniprot(acc)
        ensembl_transcript_obj = UniprotToEnsemblTranscript.find_by(proteinId: acc)
        if ensembl_transcript_obj.nil?
          _out = uniprot_mapping(acc,'ENSEMBL_ID')
          if _out.length == 0
            return {'gene'=>nil,'transcript'=>nil}
          end 
          ens_g = ''
          v = 0
          _out.each do |g|
            info = sourceLookUp( g+'?content-type=application/json' )
            if Integer(info['version'])>v
              v = Integer(info['version'])
              ens_g = info 
            end
          end
          _out_1 = uniprot_mapping(acc,'ENSEMBL_TRS_ID')
          _out_2 = ensembl_transcript(ens_g['id'])
          _out = []
          ( _out_2.keys & _out_1 ).each do |o|
            _out.push( {'id'=>o,'name'=>_out_2[o]} )
          end
          UniprotToEnsemblTranscript.create(proteinId: acc, data: {'gene'=>ens_g,'transcript'=>_out}.to_json)
          return {'gene'=>ens_g,'transcript'=>_out}
        else
          return JSON.parse(ensembl_transcript_obj.data) 
        end
      end

      def ensembl_transcript(id)
        _out = sourceLookUp( id+'?expand=1&content-type=application/json' )
        out = {}
        _out['Transcript'].each do |o|
          if o['object_type'] == 'Transcript'
            out[ o['id'] ] =  o['display_name'] 
          end
        end
        return out
      end

      def uniprot_mapping(acc,id_type='ENSEMBL_ID')
        info = Uniprotmappingentry.find_by(proteinId: acc)
        if info.nil?
          return []
        end
        out = []
        if id_type == 'ENSEMBL_ID'
          out = JSON.parse(info['gene'])
        end

        if id_type == 'ENSEMBL_TRS_ID'
          out = JSON.parse(info['transcript'])
        end
        return out
      end

    end
  end
end
