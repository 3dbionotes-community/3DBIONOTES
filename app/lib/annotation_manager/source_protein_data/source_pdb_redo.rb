module AnnotationManager
  module SourceProteinData
    module SourcePdbRedo 

      PDB_REDO_URL = Settings.GS_PDB_REDO
      LocalPath = Settings.GS_LocalUpload

      include GlobalTools::FetchParserTools
      def sourcePDB_REDO(pdbId_)
        pdbId = pdbId_
        if pdbId_ =~ /(\w{4})(_final_dot_pdb)/
          pdbId = $1
        end
        out = Pdbredoentry.find_by(pdbId:pdbId)
        pdbData = nil
        if pdbId_ =~ /^(pdb_redo_)(\d\w{3})/ then
          pdbData = JSON.parse( File.read(LocalPath+"/"+pdbId_+"/alignment.json") )
          pdbData = pdbData[pdbId+"_final.pdb"]
        elsif pdbId_ =~ /(\w{4})(_final_dot_pdb)/ then
          pdbData = JSON.parse( File.read(LocalPath+"/pdb_redo_"+pdbId+"/alignment.json") )
          pdbData = pdbData[pdbId+"_final.pdb"]
        elsif pdbId_ =~ /^(\d\w{3})$/ then
          pdbData_ = PdbDatum.find_by(pdbId: pdbId)
          if not pdbData_.nil? then
            pdbData = JSON.parse( pdbData_.data )
          end
        end
        if out.nil? and pdbId =~ /^(\d\w{3})$/ and not pdbData.nil? then
          url = PDB_REDO_URL+pdbId.downcase+"/"+pdbId.downcase+"_final.py"
          data = getUrl(url)
          data = data.chop.chop.chop.chop.chop.split("\n")
          data.shift(3)
          data = JSON.parse( "["+data.join("")+"]" )
          out = {}
          data.each do |i|
            x = i[0]
            if x =~ /^(H\-bond\sflip)(\s+)(\w+)(\s+)(\w+)(\s+)(\w+)/ then
              if pdbData.key? $5 then
                acc = pdbData[$5].keys[0]
                index = pdbData[$5][acc]['inverse'][$7]
                ch = $5
                if !out.key?(ch)
                  out[ch] = []
                end
                evidences = {'Imported information':[{url:'https://pdb-redo.eu/db/'+pdbId, 'id':pdbId, name:'Imported from PDB_REDO'}]}
                #descrption = i[1].to_s+","+i[2].to_s+","+i[3].to_s
                descrption = "H-bond flip in PDB_REDO model"
                if index.to_i > 0 then
                  out[ch].push({'begin'=>index, 'end'=>index, 'type'=>"h_bond_flip", 'description'=>descrption,'evidences'=>evidences})
                end
              end
            elsif x =~ /^(Changed\srotamer)(\s+)(\w+)(\s+)(\w+)(\s+)(\w+)/ then
              if pdbData.key? $5 then 
                acc = pdbData[$5].keys[0]
                index = pdbData[$5][acc]['inverse'][$7]
                ch = $5
                if !out.key?(ch)
                  out[ch] = []
                end
                #descrption = i[1].to_s+","+i[2].to_s+","+i[3].to_s
                descrption = "Rotamer changes in PDB_REDO model"
                evidences = {'Imported information':[{url:'https://pdb-redo.eu/db/'+pdbId, 'id':pdbId, name:'Imported from PDB_REDO'}]}
                if index.to_i > 0 then
                  out[ch].push({'begin'=>index, 'end'=>index, 'type'=>"changed_rotamer", 'description'=>descrption,'evidences'=>evidences})
                end
              end
            elsif x =~ /^(Completed)(\s+)(\w+)(\s+)(\w+)(\s+)(\w+)/ then
              if pdbData.key? $5 then
                acc = pdbData[$5].keys[0]
                index = pdbData[$5][acc]['inverse'][$7]
                ch = $5
                if !out.key?(ch)
                  out[ch] = []
                end
                #descrption = i[1].to_s+","+i[2].to_s+","+i[3].to_s
                descrption = "Completed residue in PDB_REDO model"
                evidences = {'Imported information':[{url:'https://pdb-redo.eu/db/'+pdbId, 'id':pdbId, name:'Imported from PDB_REDO'}]}
                if index.to_i > 0 then
                  out[ch].push({'begin'=>index, 'end'=>index, 'type'=>"completed_res", 'description'=>descrption,'evidences'=>evidences})
                end
              end
            elsif x =~ /^(Added\sloop)(\s+)(\w+)(\s+)(\w+)(\s+)(\w+)(\s+\-)(\w+)(\s+)(\w+)(\s+)(\w+)/ then
              if pdbData.key? $5 then
                acc = pdbData[$5].keys[0]
                start = pdbData[$5][acc]['inverse'][($7.to_i-1).to_s]+1
                ch_1 = $5
                ch_2 = $11
                end_ = pdbData[$5][acc]['inverse'][($13.to_i+1).to_s]-1
                if ch_1 == ch_2
                  if !out.key?(ch_1)
                    out[ch_1] = []
                  end
                  #descrption = i[1].to_s+","+i[2].to_s+","+i[3].to_s
                  descrption = "Completed loop in PDB_REDO model"
                  evidences = {'Imported information':[{url:'https://pdb-redo.eu/db/'+pdbId, 'id':pdbId, name:'Imported from PDB_REDO'}]}
                  if start.to_i > 0 and end_.to_i > 0
                    out[ch_1].push({'begin'=>start, 'end'=>end_, 'type'=>"completed_loop", 'description'=>descrption,'evidences'=>evidences})
                  end
                end
              end
            end
          end
          out = out.to_json
          Pdbredoentry.create(pdbId: pdbId, data: out)
        elsif pdbId =~ /^(\w{4})/ and not out.nil? then
          out = JSON.parse(out.data)
        else
          out = {}
        end
        return out
      end

    end 
  end
end
