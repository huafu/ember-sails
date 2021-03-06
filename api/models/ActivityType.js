var model = require('../lib/model');

/**
 * ActivityType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  SIGNIN:  'sign-in',
  SIGNOUT: 'sign-out',
  SIGNUP:  'sign-up',

  autoPk: false,
  // this is small data-set more like a config and should stay in local JSON
  connection: 'configDb',

  attributes: {
    id: model.attributes.pkCode(),

    label: {
      type:     'string',
      required: true
    },

    template: {
      type: 'string'
    }
  },

  /**
   * Creates the missing standard types
   * @returns {Promise}
   */
  createMissingStandardTypes: function () {
    return this.findOrCreateEach([model.primaryKeyNameFor(this)], [
      {id: this.SIGNIN, label: 'signed in'},
      {id: this.SIGNOUT, label: 'signed out'},
      {id: this.SIGNUP, label: 'signed up'}
    ]);
  }
};

