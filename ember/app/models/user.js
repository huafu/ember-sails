import DS from 'ember-data';

export default DS.Model.extend({
  displayName: DS.attr('string'),
  isClaimed:   DS.attr('boolean'),
  identities:  DS.hasMany('identity', {inverse: 'owner'})
});
