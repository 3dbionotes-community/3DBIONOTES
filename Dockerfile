FROM ruby:3.3.1

RUN apt-get update -qq && apt-get install -y apt-transport-https ca-certificates
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs yarn

WORKDIR /app
COPY Gemfile ./Gemfile
COPY Gemfile.lock ./Gemfile.lock
RUN bundle install
COPY . /app/
COPY config/database.example.yml /app/config/database.yml
COPY config/secrets.example.yml /app/config/secrets.yml
RUN cd app/assets/javascripts/3dbio_viewer && yarn install && yarn build
RUN cd app/assets/javascripts/covid19 && yarn install && yarn build