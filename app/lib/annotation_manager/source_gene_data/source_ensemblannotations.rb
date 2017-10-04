module AnnotationManager
  module SourceGeneData
    module SourceEnsemblannotations 

      EnsemblURL = "http://rest.ensembl.org/"

      def sourceENSEMBLannotations(ensembl_id)
        out = {'repeat'=>[],'simple'=>[],'constrained'=>[],'motif'=>[]}
        #returnValue = {}
        #begin
        #  data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=repeat;content-type=application/json"))
        #rescue
        #  puts "Error: #{$!}"
        #end
        #if data.code != "404"
        #  returnValue = JSON.parse(data.body)
        #end
        #returnValue.each do |i|
        #  out['repeat'].push({'x'=>i['start'],'y'=>i['end'],'description'=>i['description'],'strand'=>i['strand']})
        #end
     
        #begin
        #  data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=simple;content-type=application/json"))
        #rescue
        #  puts "Error: #{$!}"
        #end
        #if data.code != "404"
        #  returnValue = JSON.parse(data.body)
        #end
        #returnValue.each do |i|
        #  out['simple'].push({'x'=>i['start'],'y'=>i['end'],'description'=>i['logic_name'],'strand'=>i['strand']})
        #end

        #begin
        #  data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=constrained;content-type=application/json"))
        #rescue
        #  puts "Error: #{$!}"
        #end
        #if data.code != "404"
        #  returnValue = JSON.parse(data.body)
        #end
        #returnValue.each do |i|
        #  out['constrained'].push({'x'=>i['start'],'y'=>i['end'],'description'=>i['logic_name'],'strand'=>i['strand']})
        #end

        #begin
        #  data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=motif;content-type=application/json"))
        #rescue
        #  puts "Error: #{$!}"
        #end
        #if data.code != "404"
        #  returnValue = JSON.parse(data.body)
        #end
        #returnValue.each do |i|
        #  out['motif'].push({'x'=>i['start'],'y'=>i['end'],'description'=>i['motif_feature_type'],'strand'=>i['strand']})
        #end

        begin
          data = Net::HTTP.get_response(URI.parse(EnsemblURL+"overlap/id/"+ensembl_id+"?feature=transcript;feature=exon;content-type=application/json"))
        rescue
          puts "Error: #{$!}"
        end
        if data.code != "404"
          returnValue = JSON.parse(data.body)
        end

        out['transcripts'] = {'coding'=>{},'non_coding'=>{} }
        transcript = {}

        returnValue.each do |i|
          if i['feature_type'] == 'transcript' && i['Parent'] == ensembl_id
            transcript[ i['transcript_id'] ] = { 'external_name'=>i['external_name'],'biotype'=>i['biotype'] }
          end
        end
        
        returnValue.each do |i|
          if (i['feature_type'] != 'exon') or (not transcript.key?( i['Parent'] ))
            next
          end
          type = 'non_coding'
          if transcript[ i['Parent'] ][ 'biotype' ] == 'protein_coding'
            type = 'coding'
          end
          name = transcript[ i['Parent'] ][ 'external_name' ]

          if out['transcripts'][ type ].key?( name )
            out['transcripts'][ type ][ name ].push( {'x'=>i['start'],'y'=>i['end']} )
          else
            out['transcripts'][ type ][ name ] = []
            out['transcripts'][ type ][ name ].push( {'x'=>i['start'],'y'=>i['end']} )
          end
        end
        return out
      end

    end 
  end
end
