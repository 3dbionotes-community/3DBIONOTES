module InfoManager
  module SourceUniprotInfo
    module FetchUniprotTitle

      include GlobalTools::FetchParserTools
      include ProteinManager::FetchSequenceInfo

      def queryUNIPROTtitle(acc)
        data = fetchUniprotSequence(acc)
        title =  "N/A"
        if !data.nil? and data.definition.length>0
          puts(data.definition)
          if title.include? "|"
            title = data.definition.split(/\|/)[2].split(/\sOS=/)[0].split(/\s/,2)[1].upcase
          else
            title = data.definition.split(/\sOS=/)[0].split(/\s/,2)[1].upcase
          end
        end
        return {"title"=>title}
      end

    end 
  end
end
