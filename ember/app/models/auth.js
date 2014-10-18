import DS from 'ember-data';

export default DS.Model.extend({
  identity: DS.belongsTo('identity'),

  token: DS.attr('string'),

  validUntil: DS.attr('date'),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date')
});
