/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp();

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

// TODO: import this one only in development mode?
app.import('vendor/js/console.js');

app.import('vendor/js/sails.io.js');

// foundation
app.import('bower_components/modernizr/modernizr.js');
app.import('bower_components/fastclick/lib/fastclick.js');
app.import('bower_components/momentjs/moment.js');
app.import('bower_components/foundation/js/foundation.js');
app.import('bower_components/foundation-icon-fonts/foundation-icons.eot');
app.import('bower_components/foundation-icon-fonts/foundation-icons.woff');
app.import('bower_components/foundation-icon-fonts/foundation-icons.svg');
app.import('bower_components/foundation-icon-fonts/foundation-icons.ttf');

module.exports = app.toTree();
