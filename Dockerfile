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

# Install 3dbio_viewer and covid19 outside of the main app directory
RUN mkdir -p ./node-builds
COPY app/assets/javascripts/3dbio_viewer ./node-builds/3dbio_viewer/
COPY app/assets/javascripts/covid19 ./node-builds/covid19/
RUN cd ./node-builds/3dbio_viewer && yarn install && yarn build
RUN cd ./node-builds/covid19 && yarn install && yarn localize && yarn build

# Copy main app files
COPY . ./
COPY config/database.example.yml ./config/database.yml
COPY config/secrets.example.yml ./config/secrets.yml

# Precompile assets and move JS builds to public/assets
RUN RAILS_ENV=production bundle exec rake assets:clobber
RUN RAILS_ENV=production bundle exec rake assets:precompile

# Ensure clean assets directory for 3dbio_viewer and covid19
RUN rm -rf public/assets/3dbio_viewer && rm -rf public/assets/covid19
RUN mkdir public/assets/3dbio_viewer && mkdir public/assets/covid19
RUN cp -r ./node-builds/3dbio_viewer/build public/assets/3dbio_viewer/build
RUN cp -r ./node-builds/covid19/build public/assets/covid19/build
