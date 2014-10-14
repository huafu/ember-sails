import Ember from 'ember';

export default Ember.ObjectController.extend({
  modelClass: Ember.computed.oneWay('model.parentType'),

  key: function () {
    return this.get('isRelationship') ? this.get('model.key') : this.get('model.name');
  }.property('model.name', 'isRelationship', 'model.key').readOnly(),

  type: function () {
    return this.get('isRelationship') ? this.get('model.type.typeKey') : this.get('model.type');
  }.property('model.type', 'isRelationship').readOnly(),

  isArray: function () {
    return this.get('model.kind') === 'hasMany';
  }.property('model.kind').readOnly(),

  isRelationship: Ember.computed.bool('model.isRelationship'),

  isPrimaryKey: function () {
    return this.get('key') === 'id';
  }.property('key')
});
