import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.belongsTo('activityType'),

  actor: DS.belongsTo('passport'),

  subjectType: DS.attr('string'),

  subjectId: DS.attr('string'),

  extra: DS.attr('json'),

  isDeleted: DS.attr('boolean', {defaultValue: false}),

  notifications: DS.hasMany('notification', {inverse: 'activity'}),

  latitude: DS.attr('number'),

  longitude: DS.attr('number'),

  geoExtra: DS.attr('json'),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date')
});
