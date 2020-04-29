module ApplicationHelper
  def title
    base_title = "3dbionotes"
    if @title.nil?
      base_title
    else
      "#{base_title} - #{@title}"
    end
  end

  def menu_item(text, url: nil, action: nil)
    link_url = if url
      url
    elsif action
      {controller: params[:controller], action: action}
    else
      raise "[menu_item] Needs arguments url or action"
    end

    is_active = params[:action] === action

    content_tag(:li, class: "nav-item", role: "presentation") do
      link_to(text, link_url, class: ["nav-link", *(is_active ? ["active"]: [])])
    end
  end
end
