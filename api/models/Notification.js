/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    recipient: {
      model:    'Identity',
      required: true
    },

    sender: {
      model:    'Identity',
      required: true
    },

    activity: {
      model: 'Activity'
    },

    isRead: {
      type:       'boolean',
      required:   true,
      defaultsTo: false
    }
  }
};

