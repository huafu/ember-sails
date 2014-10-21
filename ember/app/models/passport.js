import DS from 'ember-data';

export default DS.Model.extend({
  protocol: DS.attr('string'),

  password: DS.attr('string'),

  identifier: DS.attr('string'),

  tokens: DS.attr('json'),

  lastLogin: DS.attr('date'),

  lastLogout: DS.attr('date'),

  lastLocation: DS.belongsTo('geoLocation'),

  user: DS.belongsTo('user', {inverse: 'passports'}),

  type: DS.belongsTo('passportType'),

  displayName: DS.attr('string'),

  avatarUrl: DS.attr('string'),

  profileUrl: DS.attr('string'),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date'),

  recordLabel: function () {
    return '%@#%@'.fmt(this.get('type.id'), this.get('identifier'));
  }.property('type.id', 'identifier').readOnly()
});
