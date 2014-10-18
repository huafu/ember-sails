/**
 * Activity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    type: {
      model:    'activityType',
      required: true
    },

    actor: {
      model:    'identity',
      required: true
    },

    subjectType: {
      type: 'string'
    },

    subjectId: {
      type: 'string'
    },

    location: {
      model: 'geoLocation'
    },

    data: {
      type: 'json'
    },

    isDeleted: {
      type:       'boolean',
      required:   true,
      defaultsTo: false
    },

    notifications: {
      collection: 'notification',
      via:        'activity'
    }
  }
};

