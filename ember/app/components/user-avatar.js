import Ember from 'ember';
import {TYPE_CODES} from '../models/passport-type';
import {urlForEmail} from './gravatar-image';

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
      value = this.get('subject.displayName') || this.get('subject.identifier');
    }
    return value;
  }.property('subject.displayName', 'subject.identifier'),

  /**
   * @property avatarUrl
   * @type String
   * @readonly
   */
  avatarUrl: function () {
    var subject, url, passports, email;
    if ((subject = this.get('subject'))) {
      url = subject.get('avatar.avatarUrl') || subject.get('avatarUrl');
      // try to get a gravatar
      if (!url) {
        if (subject.get('type.code') === TYPE_CODES.EMAIL) {
          url = urlForEmail(subject.get('identifier'));
        }
        else if ((email = subject.get('email.identifier'))) {
          url = urlForEmail(email);
        }
        else if ((passports = subject.get('passports'))) {
          email = passports.findBy('type.code', TYPE_CODES.EMAIL);
          if (email) {
            url = urlForEmail(email.get('identifier'));
          }
        }
      }
    }
    url = url || this.get('defaultAvatarUrl');
    // make the URL protocol independent
    return url.replace(/^https?:\/\//, '//');
  }.property(
    'subject.avatar.avatarUrl', 'subject.avatarUrl', 'defaultAvatarUrl',
    // in case we can use the gravatar:
    'subject.email.identifier', 'subject.passport.@each.identifier'
  ).readOnly()
});

export default UserAvatarComponent;
