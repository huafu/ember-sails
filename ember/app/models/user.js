import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  username: DS.belongsTo('passport'),

  email: DS.belongsTo('passport'),

  avatar: DS.belongsTo('passport'),

  passports: DS.hasMany('passport', {inverse: 'user'}),

  displayName: DS.attr('string'),

  isClaimed: DS.attr('boolean', {defaultValue: true}),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date'),

  recordLabel: Ember.computed.alias('displayName')
});
