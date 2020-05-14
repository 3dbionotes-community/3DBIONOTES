class ErrorsController < ApplicationController
  def routing
    respond_to do |format|
      format.html { render template: 'errors/404', layout: false, status: 404 }
      format.all { render nothing: true, status: 404 }
    end
  end
end
