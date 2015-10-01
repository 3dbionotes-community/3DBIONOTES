module ApplicationHelper
  def title
    base_title = "3dbionotes"
    if @title.nil?
      base_title
    else
      "#{base_title} - #{@title}"
    end
  end
end
