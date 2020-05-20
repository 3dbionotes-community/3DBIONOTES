# 3DBIONOTES-WS v3.1.1

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
$ rvm install ruby-2.4.1
$ gem install bundler:1.17.3
$ sudo apt install libgsl-dev libmysqlclient-dev # Debian/Ubuntu
$ bundle install
$ cp config/database.example.yml config/database.yml
$ cp config/secrets.example.yml config/secrets.yml
$ bundle exec rake db:migrate RAILS_ENV=development
$ bundle exec rails server
```

### Setup Production

```
$ rvm install ruby-2.4.1
$ a2ensite bionotes
$ ln -s /services/bionotes/apps/node/bin/node /usr/local/bin/node
$ RAILS_ENV=production bundle exec rake assets:precompile
$ touch ~/apps/bionotes/tmp/restart.txt
```

The apache configuration file to properly configure Passenger should like this:
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

## Sub-modules

The application contains two git sub-modules:
- myProtVista
   - Repository: https://github.com/3dbionotes-community/myProtVista
   - Path: app/assets/javascripts/annotations_viewer/myProtVista
   - Installation dependencies: node version 8
   - How to install:
     ```
     $ npm install
     $ node_modules/.bin/gulp build
     ```


- extendProtVista
   - Repository: https://github.com/3dbionotes-community/extendProtVista
   - Path: app/assets/javascripts/annotations_viewer/extendProtVista
   - Installation dependencies: node version 8
   - How to install:
     ```
     $ npm install
     $ npm run build
     ```

Some extra modules are also part of the application:
- featureAnalysis
   - Path: app/assets/javascripts/annotations_viewer/featureAnalysis
   - Installation dependencies: node version 8
   - How to install:
     ```
     $ npm install
     $ npm run build
     ```

- structure_viewer
   - Path: app/assets/javascripts/structure_viewer
   - Installation dependencies: node version 8
   - How to install:
     ```
     $ npm install
     $ npm run build
     ```

- interface_viewer
   - Path: app/assets/javascripts/interface_viewer
   - Installation dependencies: node version 8
   - How to install:
     ```
     $ npm install
     $ npm run build
     ```

## Other dependencies
- ngl
   - Repository: https://github.com/arose/ngl

- jsmol
   - Path: app/assets/javascripts/jsmol






Copyright (c) 2020, [Biocomputing Unit](http://biocomputingunit.es), CNB-CSIC

[![GitHub license](https://img.shields.io/github/license/3dbionotes-community/3DBIONOTES.svg)](https://github.com/3dbionotes-community/3DBIONOTES/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/3dbionotes-community/3DBIONOTES.svg)](https://github.com/3dbionotes-community/3DBIONOTES/issues)
