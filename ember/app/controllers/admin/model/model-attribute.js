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

  relationshipKind: Ember.computed.oneWay('model.kind'),

  isPrimaryKey: function () {
    return this.get('key') === 'id';
  }.property('key'),

  isEditable: function () {
    return !this.get('isPrimaryKey') &&
      (!this.get('isRelationship') || this.get('relationshipKind') === 'belongsTo');
  }.property('isPrimaryKey', 'isRelationship', 'relationshipKind').readOnly(),

  choices: function () {
    var type;
    if (!this._choices) {
      this._choices = this.container.lookup('controller:admin/model/base/records', {singleton: false});
      type = this.get('type');
      this._choices.set('model', this.store.all(type));
      if (this._choices.get('length') === 0) {
        Ember.run.debounce(this.store, 'find', type, 100);
      }
    }
    return this._choices;
  }.property('isRelationship', 'relationshipKind').readOnly()
});
