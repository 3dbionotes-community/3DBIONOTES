class WebserverController < ApplicationController
  before_action :set_viewer

  def home
    @selected_entries = Covid19.selected_entries
    @twitter_buttons = [:both]
  end

  def set_viewer
    @viewerType = 'ngl'
  end

  def viewer
    @twitter_buttons = [:bionotes]
    render layout: 'webserver'
  end

  def covid19
    @twitter_buttons = [:covidstructhub]
  end

  def help
    @twitter_buttons = [:both]
  end

  def api
    @twitter_buttons = [:both]
  end

end
