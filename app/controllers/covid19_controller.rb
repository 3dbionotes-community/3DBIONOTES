class Covid19Controller < WebserverController
  layout "webserver"

  def index
    @selected_entries = Covid19.selected_entries
    @proteins_data = Covid19.proteins_data
    @layout_options = {header: "layouts/covid_header"}
  end
end
