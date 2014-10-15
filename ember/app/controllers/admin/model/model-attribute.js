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

  _choices: null,
  choices:  function () {
    var all, type;
    if (!this.get('_choices')) {
      type = this.get('type');
      all = this.store.all(type);
      if (all.get('length') === 0) {
        Ember.run.debounce(this.store, 'findAll', type, 100);
      }
      this.set('_choices', all.sortBy('recordLabel'));
    }
    return this.get('_choices');
  }.property('isRelationship', 'relationshipKind', '_choices').readOnly()
});
