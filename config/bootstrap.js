/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

require('../api/lib/extensions');

module.exports.bootstrap = function (cb) {

  // load all passport strategies
  sails.services.passport.loadStrategies();

  // check that we have our basic passport types
  PassportType.createMissingStandardTypes()
    .then(function () {
      cb();
    }, cb);
};
