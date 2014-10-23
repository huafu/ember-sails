/* jshint node: true */

module.exports = function (environment) {
  var ENV = {
    modulePrefix:    'ember-sails',
    podModulePrefix: 'ember-sails/pods',
    environment:     environment,
    baseURL:         '/',
    locationType:    'auto',
    EmberENV:        {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
        'ember-runtime-item-controller-inline-class': true
      }
    },

    defaults: {
      date: {
        invalidFormat: '-',
        nullFormat:    '-',
        format:        'lll'
      }
    },

    APP: {
      name:            'Ember-Sails',
      // Here you can pass flags/options to your application instance
      // when it is created
      SAILS_LOG_LEVEL: 'debug'
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'auto';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
