var model = require('../lib/model');

/**
 * ActivityType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  SIGNIN:  'signin',
  SIGNOUT: 'signout',
  SIGNUP:  'signup',

  autoPk: false,

  attributes: {
    id: {
      type:       'string',
      size:       32,
      required:   true,
      primaryKey: true
    },

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

