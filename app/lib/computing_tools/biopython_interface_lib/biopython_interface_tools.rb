module ComputingTools
  module BiopythonInterfaceLib
    module BiopythonInterfaceTools

      LocalPath = Settings.GS_LocalUpload
      LocalScripts = Settings.GS_LocalScripts

      def runBiopythonInterface(pdbId_,path_)
        pdbId = pdbId_
        path = path_
        pdbId.sub! "__","."
        if path.nil?
          out = BiopythonInterface.find_by(pdbId: pdbId)
          if out.nil?
            out  = JSON.parse( `#{LocalScripts}/structure_interface_json #{pdbId} pdb` )
            if out.key?('error')
              raise "#{LocalScripts}/structure_interface_json ERROR: #{out['error']}"
            else
              BiopythonInterface.create( pdbId: pdbId, asa: out['asa'].to_json, interface:out['interface'].to_json, rri:out['rri'].to_json, rri_raw:out['rri_raw'].to_json )
            end
          else
            out = {asa:JSON.parse(out['asa']), interface:JSON.parse(out['interface']), rri:JSON.parse(out['rri']), rri_raw:JSON.parse(out['rri_raw'])}
          end
        else
          filename = LocalPath+"/"+path+"/biopython_interface_recover_data.json"
          if File.exist?(filename)
            out = recover(path)
          else
            puts("#{LocalScripts}/structure_interface_json #{pdbId} #{path}")
            out  = JSON.parse( `#{LocalScripts}/structure_interface_json #{pdbId} #{path}` )
            
            if out.key?('error')
              raise "#{LocalScripts}/structure_interface_json ERROR: #{out['error']}"
            else
              save_data(out,path)
            end
          end
          
        end
        return out
        return render json: out, status: :ok
      end

      def recover(rand)
        recover_data = JSON.parse( File.read(LocalPath+"/"+rand+"/biopython_interface_recover_data.json") )
        return recover_data
      end

      def save_data(json_data,rand)
        File.write(LocalPath+"/"+rand+"/biopython_interface_recover_data.json", json_data.to_json)
      end

    end
  end
end
