class Covid19Controller < WebserverController
  layout 'webserver'

  def index
    @selected_entries = Covid19.selected_entries
    @proteins_data = Covid19.proteins_data
  end
end
