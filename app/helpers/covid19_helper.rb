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

  def reference(links)
    content_tag(:p) do
      safe_join(links.map do |text, url|
        link_to(url, target: "_blank") do
          link_icon + content_tag(:span, text, class: "reference2")
        end
      end, " | ")
    end
  end

  def link_icon
    content_tag(:i, "", class: "fa fa-external-link-square")
  end

  def item_info(item)
    content_tag(:span) do
      safe_join([
        (content_tag(:p, item[:description]) if item[:description]),

        item[:links].map do |link|
          content_tag(:p) do
            safe_join([
              link[:title] + ":",
              link_to(link[:name], link[:query_url]),
              link[:external_url] ? link_to("[External]", link[:external_url]) : "",
            ], " ")
          end
        end.join,

        item[:related].present? ?
          content_tag(:p, "Related: #{item[:related].join(', ')}") : "",
        (item[:external_url] ? link_to("External link", item[:external_url]) : "")
      ])
    end
  end
end
