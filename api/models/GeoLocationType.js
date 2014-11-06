var model = require('../lib/model');

/**
 * GeoLocationType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  HOME:     'home',
  WORK:     'office',
  SIGNIN:   'sign-in',
  CHECKIN:  'check-in',
  VOLATILE: 'volatile',

  autoPk:     false,
  // this is small data-set more like a config and should stay in local JSON
  connection: 'configDb',

  attributes: {
    id: model.attributes.pkCode(),

    label: {
      type:     'string',
      required: true
    }
  },

  /**
   * Creates the missing standard types
   * @returns {Promise}
   */
  createMissingStandardTypes: function () {
    return this.findOrCreateEach([model.primaryKeyNameFor(this)], [
      {id: this.HOME, label: 'home'},
      {id: this.WORK, label: 'work'},
      {id: this.SIGNIN, label: 'sign-in'},
      {id: this.CHECKIN, label: 'check-in'},
      {id: this.VOLATILE, label: 'volatile'}
    ]);
  }
};

