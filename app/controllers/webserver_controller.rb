class WebserverController < ApplicationController
  before_filter :set_viewer
  def set_viewer
    @viewerType="ngl"
  end

  def covid19
  end
end
