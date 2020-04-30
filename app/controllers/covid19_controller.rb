class Covid19Controller < WebserverController
  def index
    @selected_entries = Covid19.selected_entries
    @proteins = Covid19.proteins
  end
end
