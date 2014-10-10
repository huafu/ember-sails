/**
 * IdentityType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#/documentation/concepts/ORM/Models.html
 */

module.exports = {
  autoPk: false,

  attributes: {

    id: {
      type:       'string',
      size:       16,
      primaryKey: true,
      required:   true
    },

    label: {
      type:     'string',
      required: true
    }

  }
};

