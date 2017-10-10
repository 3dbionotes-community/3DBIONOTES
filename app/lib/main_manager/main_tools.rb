module MainManager
  module MainTools
    
    include ToolsMain::BuildIdentifierType
    def identify_type(identifierName)
      return _identify_type(identifierName)
    end

    include ToolsMain::BuildViewerType
    def viewer_type(vt)
      return _viewer_type(vt)
    end

    include ToolsMain::BuildEmdbData
    def fetch_emdb_data(identifierName)
      return _fetch_emdb_data(identifierName)
    end

    include ToolsMain::BuildPdbData
    def fetch_pdb_data(identifierName)
      return _fetch_pdb_data(identifierName)
    end

    include ToolsMain::BuildUniprotData
    def fetch_uniprot_data(identifierName)
      return _fetch_uniprot_data(identifierName)
    end

  end
end
