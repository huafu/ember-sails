import Ember from 'ember';

export function urlForEmail(email, size) {
  var res;
  if (email) {
    res = 'http://www.gravatar.com/avatar/' + md5(email);
    if (size) {
      res += '?s=' + size;
    }
  }
  return res;
}

export default Ember.Component.extend({
  tagName: 'img',
  classNames: ['gravatar'],
  /**
   * @property size
   * @type Number
   */
  size:  200,
  /**
   * @property email
   * @type String
   */
  email: null,

  /**
   * @property avatarUrl
   * @type String
   */
  avatarUrl: function () {
    var email = this.get('email'),
      size = this.get('size');
    return urlForEmail(email, size).replace(/^https?:\/\//, '');
  }.property('email', 'size')
});
