module FramesHelper
  def createPfamStructure(annot,length,database)
    staticLength = 750
    proportion = staticLength.to_f/length.to_f
    structure = Hash.new
    structure[:length] = staticLength
    propStart = (annot["start"].to_i*proportion).round
    propEnd = (annot["end"].to_i*proportion).round
    if annot["start"]!=annot["end"]
      structure[:regions] = Array.new
      region = Hash.new
      region[:startStyle] = "straight"
      region[:endStyle] = "straight"
      region[:start] = propStart
      region[:end] = propEnd
      region[:colour] = "#ff8800"
      region[:display] = "true"
      region[:text] = ""
      region[:href] = "javascript:triggerCoordinates('#{annot["start"]}','#{annot["end"]}');modifyPfam(#{annot["start"]},#{annot["end"]},#{length});modifyLinks(#{annot["start"]},#{annot["end"]});"
      metadata = Hash.new
      metadata[:start] = annot["start"]
      metadata[:end] = annot["end"]
      metadata[:description] = (annot["description"] or "").gsub(";;"," ") + ((!annot["original"].nil? and !annot["variation"].nil?) ? "  Variation:#{annot["original"]}-#{annot["variation"]}" : "")
      if !annot["subtype"].nil?
        metadata[:identifier] = annot["type"] + " ("+annot["subtype"]+")"
      end
      metadata[:database] = database
      region[:metadata] = metadata
      structure[:regions].push(region)
    else
      region = Hash.new
      structure[:markups] = Array.new
      markup = Hash.new
      markup[:lineColour] = "#666666"
      markup[:colour] = "#ff8800"
      markup[:display] = "true"
      markup[:v_align] = "top"
      markup[:headStyle] = "circle"
      markup[:start] = propStart
      markup[:href] = "javascript:triggerCoordinates('#{annot["start"]}','#{annot["end"]}');modifyPfam(#{annot["start"]},#{annot["end"]},#{length});modifyLinks(#{annot["start"]},#{annot["end"]});"
      metadata = Hash.new
      metadata[:database] = "Uniprot"
      metadata[:description] = (annot["description"] or "").gsub(";;"," ") + ((!annot["original"].nil? and !annot["variation"].nil?) ? "  Variation:#{annot["original"]}-#{annot["variation"]}" : "")
      metadata[:start] = annot["start"]
      metadata[:end] = annot["end"]
      if !annot["subtype"].nil?
        metadata[:identifier] = annot["type"] + " ("+annot["subtype"]+")"
      end
      markup[:metadata] = metadata
      structure[:markups].push(markup)
    end
    return structure.to_json
  end  
end
