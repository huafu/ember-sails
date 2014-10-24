import DS from 'ember-data';
import Ember from 'ember';

export var TYPE_CODES = {
  EMAIL:    'email',
  USERNAME: 'username',
  FACEBOOK: 'facebook',
  GOOGLE:   'google',
  TWITTER:  'twitter',
  GITHUB:   'github'
};

export default DS.Model.extend({
  label: DS.attr('string'),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date'),

  recordLabel: Ember.computed.alias('label'),

  code:    Ember.computed.oneWay('id'),

  // TODO: send this from the backend without storing it in the DB
  authUrl: function () {
    return '/auth/' + this.get('code');
  }.property('code').readOnly()
});
