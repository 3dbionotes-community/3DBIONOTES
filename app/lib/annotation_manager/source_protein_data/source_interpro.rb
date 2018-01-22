module AnnotationManager
  module SourceProteinData
    module SourceInterpro 

      InterproURL = Settings.GS_InterproURL#"http://www.ebi.ac.uk/interpro/protein/"

      def sourceInterproFromUniprot(uniprotAc)
        out = InterproDatum.find_by(proteinId: uniprotAc)
        if out.nil?
          url = InterproURL+uniprotAc
          wget = `wget -qO- #{url}  | grep '/interpro/popup/supermatch' | sed 's/"//g'`
          data = wget.split("\n")
          out = []
          data.each do |i|
            r = i.split("&")
            ann = {}
            r.each do |j|
              s = j.split("=")
              ann[s[0]]=s[1]
            end
            ids = ann['entryAcs'].split(',')
            id = ids.pop()
            info = Interproentry.find_by(proteinId: id)
            if !info.nil?
              out.push({'id'=>id,'start'=>ann['start'],'end'=>ann['end'],'description'=>JSON.parse(info['data'])})
            end
          end
          if out.length > 0
            InterproDatum.create( proteinId: uniprotAc, data:out.to_json )
          end
        else
          out = out.data
        end
        return out 
      end

    end 
  end
end
