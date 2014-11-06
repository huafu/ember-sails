var str = require('../lib/string');
var record = require('../lib/record');

var activity = {

  /**
   * Log an activity
   * @param {String|ActivityType} type
   * @param {Number|User} actor
   * @param {Model} [subject]
   * @param {Object} [extra]
   * @return {Promise}
   */
  log: function (type, actor, subject, extra) {
    subject = record.polymorphize(subject);
    actor = record.identify(actor);
    type = record.identify(type);
    return Activity.create(_.merge({
      type:  type,
      actor: actor
    }, subject))
      .then(function logActivityCreated(activity) {
        sails.log.debug(
          str.fmt('[activity] logged new activity of type %@ from user %@', type, actor)
        );
        return activity;
      });
  }

};

module.exports = activity;
