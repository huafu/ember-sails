# ember-sails

A [Sails](http://sailsjs.org) application using [Ember](http://emberjs.com/) framework in the frontend, packaged with [ember-cli](http://www.ember-cli.com).


---

## Commands
Each command can be prefixed with `ENV=production` for production version


### Run the API server only
```
make serve-api
```

This will lift the Sails app using the latest built Ember app or no Ember app if it has never been built before


### Run the UI server only
```
make serve-ui
```

This will build and watch for changes in the Ember app, serving it at a different port than the one used by Sails


### Build Ember app and run the API server to serve both API and UI
```
make serve
```

This will build the Ember app and then lift the Sails app. If you want to have auto-reload enabled and reloading your Ember app when you are changing source files, run in a separate process `make serve-ui`. Sails will deliver the Ember app on its port and thanks to ember-cli and livereload the Ember app will be automatically reloaded once a source file changes there.


### Run tests
```
make test
```

This will run unit and acceptance tests
