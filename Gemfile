source 'https://rubygems.org'
ruby '3.3.1'

gem 'rails', '7.1.3.2'

#gem 'mysql2', '0.4.10'
gem 'mysql2', '0.5.6'
gem 'sqlite3', '1.4.2'

gem 'haml'
gem 'json'
gem 'bio', '1.4.3' # Preserving 1.4.3 to not break potentially existing code
gem 'nori'

gem 'rack-cors', :require => 'rack/cors'
gem 'config'
gem 'delayed_job_active_record'
gem 'daemons'
gem 'rubystats'
gem 'sprockets-rails', '3.4.2'

# Bootstrap related gems (https://github.com/twbs/bootstrap-rubygem/tree/4.6-stable)
gem 'bootstrap', '~> 4.6.2'
gem 'jquery-rails', '4.6.0'
gem 'sassc-rails', '>= 2.1.0' # Required for bootstrap, but deprecated

gem 'uglifier'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug'

  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
end

group :production do
  gem 'passenger', '5.1.12'
end
