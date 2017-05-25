class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  rescue_from Exception do |exception|
    render_403(exception)
  end
  def render_403(exception)
    logger.warn("Message for log.")
    @error_message = exception.message
    respond_to do |format|
      format.html { render template: 'errors/global_exception', layout: "layouts/webserver", status: 500 }
      format.all { render nothing: true, status: 500 }
    end
  end
end
