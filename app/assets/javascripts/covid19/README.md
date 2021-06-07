## Setup

Install dependencies:

```
$ yarn install
```

## Development

Start development server:

```
$ PORT=3002 yarn start
```

Linting:

```
$ yarn lint
```

## Tests

Run unit tests:

```
$ yarn test
```

Run integration tests locally:

```
$ export CYPRESS_ROOT_URL=http://localhost:3002

# non-interactive
$ yarn cy:e2e:run

# interactive UI
$ yarn cy:e2e:open
```

## Build app ZIP

```
$ yarn build-webapp
```

## Some development tips

### Structure

-   `i18n/`: Contains literal translations (gettext format)
-   `public/`: Main app folder with a `index.html`, exposes the APP, contains the feedback-tool.
-   `src/pages`: Main React components.
-   `src/domain`: Domain layer of the app (clean architecture)
-   `src/data`: Data of the app (clean architecture)
-   `src/components`: Reusable React components.
-   `src/types`: `.d.ts` file types for modules without TS definitions.
-   `src/utils`: Misc utilities.
-   `src/locales`: Auto-generated, do not update or add to the version control.
-   `cypress/integration/`: Cypress integration tests.

### i18n

```
$ yarn update-po
# ... add/edit translations in i18n/*.po files ...
$ yarn localize
```

### App context

The file `src/contexts/app-context.ts` holds some general context so typical infrastructure objects (`api`, `d2`, ...) are readily available. Add your own global objects if necessary.

### Scripts

Check the example script, entry `"script-example"`in `package.json`->scripts and `src/scripts/example.ts`.
