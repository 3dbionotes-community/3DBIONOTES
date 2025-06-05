FROM ruby:3.3.1

RUN apt-get update -qq && apt-get install -y apt-transport-https ca-certificates curl
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs yarn default-libmysqlclient-dev

WORKDIR /app
COPY Gemfile ./Gemfile
COPY Gemfile.lock ./Gemfile.lock
RUN bundle install
COPY . /app/
COPY config/database.example.yml /app/config/database.yml
COPY config/secrets.example.yml /app/config/secrets.yml
RUN cd app/assets/javascripts/3dbio_viewer && yarn install && yarn build
RUN cd app/assets/javascripts/covid19 && yarn install && yarn localize && yarn build

# Precompile assets and move JS builds to public/assets
RUN RAILS_ENV=production bundle exec rake assets:clobber
RUN RAILS_ENV=production bundle exec rake assets:precompile
RUN mkdir public/assets/3dbio_viewer
RUN mkdir public/assets/covid19
RUN cp -r app/assets/javascripts/3dbio_viewer/build public/assets/3dbio_viewer/build
RUN cp -r app/assets/javascripts/covid19/build public/assets/covid19/build