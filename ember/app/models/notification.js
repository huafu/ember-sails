import DS from 'ember-data';

export default DS.Model.extend({
  recipient: DS.belongsTo('identity'),

  sender: DS.belongsTo('identity'),

  activity: DS.belongsTo('activity'),

  isRead: DS.attr('boolean', {defaultValue: false}),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date')
});
