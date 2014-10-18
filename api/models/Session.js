/**
 * Session.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    owner: {
      model:    'user',
      required: true
    },

    initiator: {
      model:    'auth',
      required: true
    },

    data: {
      type:       'json',
      required:   true,
      defaultsTo: {}
    },

    validUntil: {
      type:     'datetime',
      required: true
    }
  }
};

