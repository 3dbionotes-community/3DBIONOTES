module Covid19Helper
  PROTEIN_COLORS = {
    "S" => "w3-cyan",
  }

  def protein_css_class(protein)
    PROTEIN_COLORS[protein[:name]] || "w3-gray"
  end
end
