module InfoManager
  module SourceUniprotInfo
    module FetchUniprotSequence

      include GlobalTools::FetchParserTools
      include ProteinManager::FetchSequenceInfo

      def queryUNIPROTsequence(acc)
        fasta = fetchUniprotSequence(acc)
        return  fasta.seq
      end

    end 
  end
end
