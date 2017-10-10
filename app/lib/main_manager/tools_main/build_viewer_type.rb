module MainManager
  module ToolsMain
    module BuildViewerType
    
      def _viewer_type(vt)
        if !vt.nil? and vt=="chimera"
          viewerType = "chimera"
        elsif !vt.nil? and vt=="jsmol"
          viewerType = "jsmol"
        else
          viewerType = "ngl"
        end
        return viewerType
      end

    end
  end
end
