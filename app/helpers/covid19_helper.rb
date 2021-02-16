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

  def description_text(item)
    if item[:description]
      content_tag(:p, content_tag(:em, item[:description]))
    elsif item[:api]
      content_tag(:p, content_tag(:em, 'Retrieving information...', class: "no-description"))
    end
  end

  def item_info(item)
    content_tag(:span) do
      safe_join([
        description_text(item),

        item[:links].map do |link|
          content_tag(:p) do
            content_tag(:span, link[:title] + ": ") + link_to(link[:name], link[:query_url]) +

            (content_tag(:span, class: "h", "data-check": link[:external_url]) do
              content_tag(:span, " | ") +
              (link[:external_url] ? link_to(content_tag(:span, "External ") + link_icon, link[:external_url], target: "_blank") : "")
            end)
          end
        end.join,

        item[:related].present? ?
          content_tag(:p, "Related: #{item[:related].join(', ')}") : "",
        (item[:external] ?
          link_to(content_tag(:span, item[:external][:text]) + " " + link_icon, item[:external][:url], target: "_blank")
          : ""),
      ])
    end
  end
end
