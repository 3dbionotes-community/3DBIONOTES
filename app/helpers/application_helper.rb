module ApplicationHelper
  def title
    base_title = "3dbionotes"
    if @title.nil?
      base_title
    else
      "#{base_title} - #{@title}"
    end
  end

  def menu_item(text, path)
    link_url = path.is_a?(String) ? path: params.merge(path)
    is_active = path.is_a?(Hash) ? params[:action] === path[:action] : false

    content_tag(:li, class: "nav-item", role: "presentation") do
      link_to(text, link_url, class: ["nav-link", *(is_active ? ["active"]: [])])
    end
  end
end
