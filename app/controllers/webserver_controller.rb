class WebserverController < ApplicationController
  before_action :set_viewer

  def home
    @selected_entries = Covid19.selected_entries
  end

  def set_viewer
    @viewerType = 'ngl'
  end

  def covid19
  end

  def viewer
    @skip_footer = true
    render layout: 'webserver'
  end
end
