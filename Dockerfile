FROM ruby:3.3.1

RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs
#RUN apk update && apk add --no-cache nodejs npm yarn build-base mysql-dev sqlite-dev gsl-dev

RUN mkdir /app/
WORKDIR /app
COPY Gemfile ./Gemfile
COPY Gemfile.lock ./Gemfile.lock
RUN bundle install
COPY . /app/
COPY config/database.example.yml /app/config/database.yml
COPY config/secrets.example.yml /app/config/secrets.yml