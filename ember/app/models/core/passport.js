import DS from 'ember-data';

export default DS.Model.extend({
  protocol: DS.attr('string'),

  identifier: DS.attr('string'),

  tokens: DS.attr('json'),

  lastLoginAt: DS.attr('date'),

  lastLocation: DS.belongsTo('geoLocation'),

  user: DS.belongsTo('user', {inverse: 'passports'}),

  type: DS.belongsTo('passportType'),

  displayName: DS.attr('string'),

  gender: DS.attr('string'),

  avatarUrl: DS.attr('string'),

  profileUrl: DS.attr('string'),

  raw: DS.attr('json'),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date')
});
