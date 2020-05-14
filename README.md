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

Use rvm or rbenv to select the Ruby version specified in Gemfile and then run:

```
$ gem install bundler:1.17.3
$ sudo apt install libgsl-dev libmysqlclient-dev # Debian/Ubuntu
$ bundle install
$ cp config/database.example.yml config/database.yml
$ cp config/secrets.example.yml config/secrets.yml
$ bundle exec rake db:migrate RAILS_ENV=development
$ bundle exec rails server
```

Copyright (c) 2018-19, [Biocomputing Unit](http://biocomputingunit.es), CNB-CSIC

[![GitHub license](https://img.shields.io/github/license/3dbionotes-community/3DBIONOTES.svg)](https://github.com/3dbionotes-community/3DBIONOTES/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/3dbionotes-community/3DBIONOTES.svg)](https://github.com/3dbionotes-community/3DBIONOTES/issues)
