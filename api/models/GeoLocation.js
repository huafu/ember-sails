/**
 * GeoLocation.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    lat: {
      type:     'float',
      required: true
    },

    lng: {
      type:     'float',
      required: true
    },

    radius: {
      type:     'float',
      required: false
    },

    type: {
      model:    'GeoLocationType',
      required: true
    },

    source: {
      model:    'GeoLocationSource',
      required: true
    },

    extra: {
      type: 'json'
    }
  }
};

