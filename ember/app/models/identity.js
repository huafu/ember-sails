import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  type: DS.belongsTo('identityType'),

  owner: DS.belongsTo('user'),

  lastLocation: DS.belongsTo('geoLocation'),

  value: DS.attr('string'),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date'),

  recordLabel: Ember.computed.alias('value')
});
