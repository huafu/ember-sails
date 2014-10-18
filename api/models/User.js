/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#/documentation/concepts/ORM/Models.html
 */
var str = require('../lib/string');

module.exports = {

  attributes: {

    firstName: {
      type:     'string',
      required: true
    },

    lastName: {
      type: 'string'
    },

    isClaimed: {
      type:       'boolean',
      defaultsTo: false
    },

    identities: {
      collection: 'identity',
      via:        'owner'
    },


    getFullName: function () {
      return str.trim((this.firstName || '') + ' ' + (this.lastName || ''));
    }

  }
};

