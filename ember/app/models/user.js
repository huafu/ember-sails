import DS from 'ember-data';
import Ember from 'ember';
import UserCore from './core/user';

export default UserCore.extend({
  username: DS.belongsTo('passport', {inverse: null}),

  email: DS.belongsTo('passport', {inverse: null}),

  avatar: DS.belongsTo('passport', {inverse: null}),

  recordLabel: Ember.computed.alias('displayName')
});
