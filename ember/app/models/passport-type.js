//import DS from 'ember-data';
import Ember from 'ember';
import PassportTypeCore from './core/passport-type';

export var TYPE_CODES = {
  EMAIL:    'email',
  USERNAME: 'username',
  FACEBOOK: 'facebook',
  GOOGLE:   'google',
  TWITTER:  'twitter',
  GITHUB:   'github'
};

export default PassportTypeCore.extend({
  code:    Ember.computed.oneWay('id'),

  recordLabel: Ember.computed.alias('label'),

  // TODO: send this from the backend without storing it in the DB
  authUrl: function () {
    return '/auth/' + this.get('code');
  }.property('code').readOnly()
});
