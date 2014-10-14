import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  type:  DS.belongsTo('identity-type', {inverse: false}),
  value: DS.attr('string'),
  owner: DS.belongsTo('user', {inverse: 'identities'}),

  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),

  recordLabel: Ember.computed.alias('value')
});
