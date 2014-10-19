/**
 * ActivityType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  autoPk: false,

  attributes: {
    id: {
      type:     'string',
      size:     32,
      required: true,
      primaryKey:   true
    },

    label: {
      type:     'string',
      required: true
    },

    template: {
      type: 'string'
    }
  }
};

