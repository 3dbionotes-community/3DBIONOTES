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

  def reference(text, urls)
    content_tag(:p) do
      safe_join([
        content_tag(:i, "", class: "fa fa-external-link-square"),
        content_tag(:span, text + " - ", class: "reference"),
        safe_join(urls.map { |url| content_tag(:a, "link", href: url, target: "_blank") }, " | "),
      ])
    end
  end

  def item_info(item)
    content_tag(:span) do
      item[:links].map do |link|
        content_tag(:p) do
          link_to link[:name], link[:url], {class: "card-link"}
        end
      end.join + (
        item[:related].present? ?
          content_tag(:p, "Related: #{item[:related].join(', ')}") : ""
        ) +
        link_to("External link", item[:external_link])
    end
  end
end
