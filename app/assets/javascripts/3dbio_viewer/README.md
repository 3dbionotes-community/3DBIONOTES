Viewer component for 3dbionotes.

## Setup

```shell
$ yarn install

$ git clone https://github.com/PDBeurope/protvista-pdb
$ (cd protvista-pdb && npm install && npm run build && yarn link)

$ git clone https://github.com/PDBeurope/pdbe-molstar
$ (cd pdbe-molstar && npm install && npm run build && yarn link)

$ yarn link protvista-pdb
$ yarn link pdbe-molstar
```

## Build

```shell
$ $ yarn build
```

## Development

```shell
$ PORT=3001 yarn start
```
