import Ember from 'ember';

/**
 * @class UserAvatarComponent
 * @constructor
 */
var UserAvatarComponent = Ember.Component.extend({
  tagName:           'img',
  classNames:        ['user-avatar'],
  attributeBindings: ['avatarUrl:src', 'title', 'title:alt'],
  /**
   * @property subject
   * @type {User|Passport}
   */
  subject:           null,

  // TODO: move this into the config
  /**
   * @property defaultAvatarUrl
   * @type String
   */
  defaultAvatarUrl:  'assets/default-avatar.png',

  /**
   * @property title
   * @type String
   */
  title: function (key, value) {
    if (arguments.length < 2) {
      value = this.get('subject.displayName');
    }
    return value;
  }.property('subject.displayName'),

  /**
   * @property avatarUrl
   * @type String
   * @readonly
   */
  avatarUrl: function () {
    var subject, url;
    if ((subject = this.get('subject'))) {
      url = subject.get('avatar.avatarUrl') || subject.get('avatarUrl');
    }
    url = url || this.get('defaultAvatarUrl');
    // make the URL protocol independent
    return url.replace(/^https?:\/\//, '//');
  }.property(
    'subject.avatar.avatarUrl', 'subject.avatarUrl', 'defaultAvatarUrl'
  ).readOnly()
});

export default UserAvatarComponent;
