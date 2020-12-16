class WebserverController < ApplicationController
  before_filter :set_viewer

  def set_viewer
    @viewerType = "ngl"
  end

  def covid19
  end

  def viewer
    render layout: "webserver_bare"
  end
end
