import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.belongsTo('activityType'),

  actor: DS.belongsTo('passport'),

  subjectType: DS.attr('string'),

  subjectId: DS.attr('string'),

  location: DS.belongsTo('geoLocation'),

  data: DS.attr('json'),

  isDeleted: DS.attr('boolean', {defaultValue: false}),

  notifications: DS.hasMany('notification', {inverse: 'activity'}),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date')
});
