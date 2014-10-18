import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  displayName: DS.attr('string'),

  isClaimed: DS.attr('boolean', {defaultValue: false}),

  identities: DS.hasMany('identity', {inverse: 'owner'}),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date'),

  firstName: function (key, value) {
    var str;
    if (arguments.length >= 2) {
      Ember.assert(
        'First name must be a string of at least 1 character',
          Ember.typeOf(value) === 'string' &&
          (str = value.trim().capitalize().replace(/[\s\-]+/g, '-')).length > 0
      );
      this.set('displayName', (str + ' ' + this.get('lastName')).trim());
    }
    return this.get('displayName').split(' ').shift();
  }.property('displayName'),

  lastName: function (key, value) {
    var str;
    if (arguments.length >= 2) {
      str = (value || '').trim().capitalize().replace(/[\s\-]+/g, function (s) {
        return s[0];
      });
      this.set('displayName', (this.get('firstName') + ' ' + str).trim());
    }
    return    this.get('displayName').split(' ').slice(1).join(' ');
  }.property('displayName'),

  recordLabel: Ember.computed.alias('displayName')
});
