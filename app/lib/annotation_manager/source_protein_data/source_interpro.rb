module AnnotationManager
  module SourceProteinData
    module SourceInterpro 

      InterproURL = "http://www.ebi.ac.uk/interpro/protein/"

      def sourceInterproFromUniprot(uniprotAc)
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
        return out 
      end

    end 
  end
end
