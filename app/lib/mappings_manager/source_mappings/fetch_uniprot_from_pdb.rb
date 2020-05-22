module MappingsManager
  module SourceMappings
    module FetchUniprotFromPdb

      include GlobalTools::FetchParserTools
      include MappingsSites
      include InfoManager::FetchPdbInfo
      include AlignmentsManager::BuildAlignments

      def queryUniprotfromPDB(pdbId)
        uniprotFromPDB = {}
        if pdbId =~ /^\d{1}\w{3}$/
          data = fetchPDBalignment(pdbId)
        end
        if !data.nil? 
          data.each do |ch,v|
            v.each do |acc,w|
              uniprotFromPDB[acc] = [] unless(uniprotFromPDB.key?(acc))
              uniprotFromPDB[acc].push(ch)
            end
          end
        end
        if uniprotFromPDB == {} then
          is_available = fetchPDBavailty(pdbId)
          if is_available.key?('available') && is_available['available'] == true
            uniprotFromPDB = {pdbId=>[]}
          end
        else
          uniprotFromPDB = {pdbId=>uniprotFromPDB}
        end
        return uniprotFromPDB
      end

    end
  end
end
