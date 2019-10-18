module MainManager
  module ToolsMain
    module BuildIdentifierType
    
      def _identify_type(identifierName)
        if identifierName != nil
          if identifierName.upcase =~ /^EMD-\d+$/
            identifierName.upcase!
            identifierType = "EMDB"
          elsif identifierName.downcase =~ /^\d{1}\w{3}$/ and identifierName.downcase !~ /^\d{4}$/
            identifierName.downcase!
            identifierType = "PDB"
          elsif identifierName.upcase =~ /^[OPQ][0-9][A-Z0-9]{3}[0-9]$|^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/
            identifierName.upcase!
            identifierType = "Uniprot"
          else
            identifierType = nil
          end
        end
        return identifierType
      end

    end
  end
end
