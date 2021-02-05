Viewer component for 3dbionotes.

## Setup

```shell
$ yarn install
```

## Build

```shell
$ $ yarn build
```

## Development

```shell
$ PORT=3001 yarn start
```

If you need to make change in protvista-pdb or pdbe-molstar, run:

```shell
$ git clone https://github.com/EyeSeeTea/protvista-pdb
$ (cd protvista-pdb && npm install && npm run build && yarn link)

$ git clone https://github.com/EyeSeeTea/pdbe-molstar
$ (cd pdbe-molstar && npm install && npm run build && yarn link)

$ yarn link @3dbionotes/protvista-pdb
$ yarn link @3dbionotes/pdbe-molstar
```

And, finally, change the `<script src="..."` tags in `public/index.html` to the version you are using in the cloned repos.
