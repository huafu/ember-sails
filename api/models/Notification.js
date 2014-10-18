/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    recipient: {
      model:    'identity',
      required: true
    },

    sender: {
      model:    'identity',
      required: true
    },

    activity: {
      model: 'activity'
    },

    isRead: {
      type:       'boolean',
      required:   true,
      defaultsTo: false
    }
  }
};

