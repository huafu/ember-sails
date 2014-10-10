import DS from 'ember-data';

export default DS.Model.extend({
  type:  DS.belongsTo('identity-type', {inverse: false}),
  value: DS.attr('string'),
  owner: DS.belongsTo('user', {inverse: 'identities'})
});
