module Covid19Helper
  PROTEIN_COLORS = {
    "S" => "w3-cyan",
  }

  def protein_css_class(protein)
    PROTEIN_COLORS[protein[:name]] || "w3-gray"
  end

  def section_popup_title(protein, section)
    [protein[:name], section[:parent], section[:name]].compact.join(" > ")
  end
end
