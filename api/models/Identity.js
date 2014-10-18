/**
 * Identity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#/documentation/concepts/ORM/Models.html
 */

module.exports = {

  attributes: {

    type: {
      model:    'identityType',
      required: true
    },

    owner: {
      model:    'user',
      required: true
    },

    lastLocation: {
      model: 'geoLocation'
    },

    displayName: {
      type: 'string'
    },

    value: {
      type:     'string',
      required: true
    }

  }
};

