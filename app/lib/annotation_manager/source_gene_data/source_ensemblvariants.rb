module AnnotationManager
  module SourceGeneData
    module SourceEnsemblvariants 

      EnsemblURL = "http://rest.ensembl.org/"

      def sourceENSEMBLvariants(ensembl_id)
        out = Ensemblvariantentry.find_by(geneId: ensembl_id)
        if out.nil?
          out = {'variation'=>[],'somatic_variation'=>[]}
          returnValue = {}
          begin
            data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=variation;feature=somatic_variation;feature=structural_variation;feature=somatic_structural_variation;content-type=application/json"))
          rescue
            puts "Error: #{$!}"
          end
          if data.code != "404"
            returnValue = JSON.parse(data.body)
          end
          flag = false
          if returnValue.is_a?(Array)
            returnValue.each do |i|
              _start = i['start']
              _end = i['end']
              if i['end'] < i['start']
                _start = i['end']
                _end = i['start']
              end
              if !i['clinical_significance'].nil? && i['clinical_significance'].length > 0
                flag = true
                out['variation'].push({'x'=>_start,'y'=>_end,'source'=>i['source'],'id'=>i['id'],'alleles'=>i['alleles'],'clinical_significance'=>i['clinical_significance'],'consequence_type'=>i['consequence_type'],'strand'=>i['strand']})
              end
            end
          end
          if flag
            Ensemblvariantentry.create(geneId: ensembl_id, data: out.to_json)
          end
          #returnValue = {}
          #begin
          #  data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=somatic_variation;content-type=application/json"))
          #rescue
          #  puts "Error: #{$!}"
          #end
          #if data.code != "404"
          #  returnValue = JSON.parse(data.body)
          #end
          #returnValue.each do |i|
          #  _start = i['start']
          #  _end = i['end']
          #  if i['end'] < i['start']
          #    _start = i['end']
          #    _end = i['start']
          #  end
          #  if i['clinical_significance'].length > 0
          #    out['somatic_variation'].push({'x'=>_start,'y'=>_end,'alleles'=>i['alleles'],'clinical_significance'=>i['clinical_significance'],'consequence_type'=>i['consequence_type'],'strand'=>i['strand']})
          #  end
          #end
        else
          out  = out.data
        end

        return out
      end

    end 
  end
end
