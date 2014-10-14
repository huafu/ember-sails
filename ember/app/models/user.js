import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  displayName: DS.attr('string'),
  isClaimed:   DS.attr('boolean'),
  identities:  DS.hasMany('identity', {inverse: 'owner'}),

  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),

  recordLabel: Ember.computed.alias('displayName')
});
