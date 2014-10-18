import DS from 'ember-data';

export default DS.Model.extend({
  owner: DS.belongsTo('user'),

  initiator: DS.belongsTo('auth'),

  data: DS.attr('json', {defaultValue: {}}),

  validUntil: DS.attr('date'),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date')
});
