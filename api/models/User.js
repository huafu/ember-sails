/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#/documentation/concepts/ORM/Models.html
 */

module.exports = {

  attributes: {

    displayName: {
      type:     'string',
      required: true
    },

    isClaimed: {
      type:       'boolean',
      defaultsTo: false
    },

    identities: {
      collection: 'identity',
      via:        'owner'
    }

  }
};

