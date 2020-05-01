class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  require 'net/http'
  protect_from_forgery with: :exception

 unless Rails.env.development?
    rescue_from Exception do |exception|
      render_403(exception)
    end
 end

  def render_403(exception)
    if request.format != :js
      @error_short = exception.message
      @error_message = "\n\nEXCEPTION\n"+exception.message+"\n"+exception.backtrace.join("\n")+"\nEND exception\n\n"
      logger.warn( @error_message )
      respond_to do |format|
        format.html { render template: 'errors/global_exception', layout: "layouts/webserver", status: 500 }
        format.all { render nothing: true, status: 500 }
      end
    end
  end

end
