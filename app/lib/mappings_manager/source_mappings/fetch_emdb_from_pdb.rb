module MappingsManager
    module SourceMappings
      module FetchEmdbFromPdb
  
        include GlobalTools::FetchParserTools
        include MappingsSites
  
        def queryEmdbfromPDB(pdbId)
          emdbFromPDB = Hash.new
          if pdbId =~ /^\d{1}\w{3}$/
            qry = makeRequest(Server+PDBSumary,pdbId)
          end
          if !qry.nil?
            data = JSON.parse(qry)
            data.each do |k,v|
                tmpArray = []
                v.each do |re|
                    unless (re["related_structures"][0]["accession"] rescue nil).nil?
                        tmpArray<<re["related_structures"][0]["accession"]
                    end
                end
                emdbFromPDB[k]=tmpArray
            end
          end
          return emdbFromPDB
        end
      end
    end
  end