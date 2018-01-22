module AnnotationManager
  module SourceProteinData
    module SourcePdbRedo 

      PDB_REDO_URL = Settings.GS_PDB_REDO

      include GlobalTools::FetchParserTools
      def sourcePDB_REDO(pdbId)
        out = Pdbredoentry.find_by(pdbId:pdbId)
        if out.nil?
          pdbData = JSON.parse( PdbDatum.find_by(pdbId: pdbId).data )
          url = PDB_REDO_URL+"/"+pdbId.downcase+"/"+pdbId.downcase+"_final.py"
          data = getUrl(url)
          data = data.chop.chop.chop.chop.chop.split("\n")
          data.shift(3)
          data = JSON.parse( "["+data.join("")+"]" )
          out = {}
          data.each do |i|
            x = i[0]
            if x =~ /^(H\-bond\sflip)(\s+)(\w+)(\s+)(\w+)(\s+)(\w+)/ then
              acc = pdbData[$5].keys[0]
              index = pdbData[$5][acc]['inverse'][$7]
              ch = $5
              if !out.key?(ch)
                out[ch] = []
              end
              evidences = {'Imported information':[{url:'https://pdb-redo.eu/db/'+pdbId, 'id':pdbId, name:'Imported from PDB_REDO'}]}
              out[ch].push({'begin'=>index, 'end'=>index, 'type'=>"h_bond_flip", 'description'=>i[1].to_s+","+i[2].to_s+","+i[3].to_s,'evidences'=>evidences})
            elsif x =~ /^(Changed\srotamer)(\s+)(\w+)(\s+)(\w+)(\s+)(\w+)/ then
              acc = pdbData[$5].keys[0]
              index = pdbData[$5][acc]['inverse'][$7]
              ch = $5
              if !out.key?(ch)
                out[ch] = []
              end
              evidences = {'Imported information':[{url:'https://pdb-redo.eu/db/'+pdbId, 'id':pdbId, name:'Imported from PDB_REDO'}]}
              out[ch].push({'begin'=>index, 'end'=>index, 'type'=>"changed_rotamer", 'description'=>i[1].to_s+","+i[2].to_s+","+i[3].to_s,'evidences'=>evidences})
            end
          end
          out = out.to_json
          Pdbredoentry.create(pdbId: pdbId, data: out)
        else
          out = out.data
        end
        return out
      end

    end 
  end
end
