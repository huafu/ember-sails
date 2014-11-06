var model = require('../lib/model');

/**
 * GeoLocation.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  SOURCE_IP:      'ip',
  SOURCE_GPS:     'gps',
  SOURCE_BROWSER: 'browser',

  attributes: model.addGeoAttributes(true, {

    type: {model: 'GeoLocationType', required: true},

    label: {type: 'string'},

    accuracy: {type: 'integer', min: 0, max: 10},

    source: {type: 'string', required: true},

    description: {type: 'string'}

  }),


  /**
   * Default accuracy for given source
   *
   * @method defaultAccuracy
   * @param {String} source
   * @returns {Number}
   */
  defaultAccuracy: function (source) {
    return {
        ip:      6,
        browser: 4,
        gps:     1
      }[source] || 7;
  }
};

