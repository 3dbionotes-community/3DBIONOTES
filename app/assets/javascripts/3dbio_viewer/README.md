Viewer component for 3dbionotes.

## Setup

```shell
$ yarn install
```

## Build

```shell
$ yarn build

# On main Rails app
$ RAILS_ENV=production bundle exec rake assets:precompile
```

## Development

```shell
$ PORT=3001 yarn start
```

You can use `localhost:8000` for development if you are deploying the BWS backend on your local machine and `localhost:3000` for the Ruby on Rails service.

```
REACT_APP_BWS=https://3dbionotes.cnb.csic.es
REACT_APP_3DBIO=https://3dbionotes.cnb.csic.es
```

If you need to make change in protvista-pdb or pdbe-molstar, run:

```shell
$ git clone https://github.com/EyeSeeTea/protvista-pdb
$ (cd protvista-pdb && npm install && rm -rf node_modules/.cache && npm run build && yarn link)

$ git clone https://github.com/EyeSeeTea/pdbe-molstar
$ (cd pdbe-molstar && npm install && npm run build && yarn link)

$ yarn link @3dbionotes/protvista-pdb
$ yarn link @3dbionotes/pdbe-molstar
```

And, finally, change the `<script src="..."` tags in `public/index.html` to the version you are using in the cloned repos. Run `yarn run watch` on the repositories your are making changes.
