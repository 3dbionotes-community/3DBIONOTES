# 3DBIONOTES-WS v3.10.2

## Integrating molecular biology

**3DBIONOTES-WS** is a web application designed to automatically annotate biochemical and biomedical information onto structural models. Current sources of information include:

-   post-translational modifications
-   genomic variations associated to diseases
-   short linear motifs,
-   immune epitopes sites,
-   disordered regions and
-   domain families.

## Setup

### Setup Development

Use rvm or rbenv to select the Ruby version specified in Gemfile and then run:

```
$ git submodule update --recursive --init
$ rvm install ruby-3.3.1
$ gem install bundler:2.5.10
$ sudo apt install libmysqlclient-dev # Debian/Ubuntu
$ bundle install
$ cp config/database.example.yml config/database.yml
$ cp config/secrets.example.yml config/secrets.yml
$ bundle exec rake db:migrate RAILS_ENV=development
$ bundle exec rails server
```

### Setup Developent on macOS

Before you start your setup, make sure you have homebrew, ruby, rvm and python2 installed.
Use rvm or rbenv to select the Ruby version specified in Gemfile and then run:

```
$ git submodule update --recursive --init
$ rvm install ruby-3.3.1
$ gem install bundler:2.2.15
$ brew install gsl mysql
$ gem install bundler:2.0.0.pre.3
```

In the Gemfile, remove Gem specs for `mini_racer` and `libv8` and the dependency for `mini_racer`

```
$ bundle _2.0.0.pre.3_ install
$ cp config/database.example.yml config/database.yml
$ cp config/secrets.example.yml config/secrets.yml
$ bundle exec rake db:migrate RAILS_ENV=development
$ bundle exec rails server
```

### Setup Viewer

If you want to set up the React protein viewer as well, open up a separate terminal tab (while the Ruby app is running!) and run:

```
$ cd app/assets/javascripts/3dbio_viewer/
$ yarn install
$ yarn start
```

Then go to localhost:3001 and you'll see the viewer!

### Setup Production

Add Passenger setup to `/etc/apache2/apache2.conf`:

```
LoadModule passenger_module /services/bionotes/.rvm/gems/ruby-2.4.1@bionotes/gems/passenger-5.1.12/buildout/apache2/mod_passenger.so
   <IfModule mod_passenger.c>
     PassengerRoot /services/bionotes/.rvm/gems/ruby-2.4.1@bionotes/gems/passenger-5.1.12
     PassengerDefaultRuby /services/bionotes/.rvm/gems/ruby-2.4.1@bionotes/wrappers/ruby
     PassengerMaxPoolSize 64
     PassengerMinInstances 32
     PassengerPoolIdleTime 60
   </IfModule>
```

The site configuration file (`/etc/apache2/sites-enabled/bionotes`) for Apache should like this:

```
<VirtualHost *:80>
   ServerName XXX.cnb.csic.es
   PassengerRoot /services/bionotes/.rvm/gems/ruby-2.4.1@bionotes/gems/passenger-5.1.12
   PassengerRuby /services/bionotes/.rvm/gems/ruby-2.4.1@bionotes/wrappers/ruby
   DocumentRoot /services/bionotes/apps/bionotes/public
   RailsEnv production
   <Directory /services/bionotes/apps/bionotes/public>
      # This relaxes Apache security settings.
      AllowOverride all
      # MultiViews must be turned off.
      Options -MultiViews
      # Uncomment this if you're on Apache >= 2.4:
      #Require all granted
   </Directory>
</VirtualHost>
```

And finally, run:

```
$ rvm install ruby-2.4.1
$ passenger-install-apache2-module --auto
$ sudo a2ensite bionotes
$ sudo ln -s /services/bionotes/apps/node/bin/node /usr/local/bin/node
$ RAILS_ENV=production bundle exec rake assets:precompile
$ sudo /etc/init.d/apache2 restart
```

To perform an app restart after a change, just run:

```
$ touch tmp/restart.txt
```

## Delayed Jobs

The network sections run a set of jobs in the background on the server. To work properly, a delayed job daemon needs to be running on the server:

```
$ RAILS_ENV=production bin/delayed_job -n 6 restart
```

## Other dependencies

-   ngl

    -   Repository: https://github.com/arose/ngl

-   jsmol
    -   Path: app/assets/javascripts/jsmol

Copyright (c) 2020, [Biocomputing Unit](http://biocomputingunit.es), CNB-CSIC

[![GitHub license](https://img.shields.io/github/license/3dbionotes-community/3DBIONOTES.svg)](https://github.com/3dbionotes-community/3DBIONOTES/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/3dbionotes-community/3DBIONOTES.svg)](https://github.com/3dbionotes-community/3DBIONOTES/issues)
