import Ember from 'ember';

export default Ember.ObjectController.extend({
  modelClass: function () {
    return this.store.modelFor(this.get('model.name'));
  }.property('model.name').readOnly(),

  attributes: function () {
    var Model = this.get('modelClass');
    var attributes = [
      {name: 'id', type: 'string', parentType: Model, isAttribute: true}
    ];

    Model.eachAttribute(function (name, meta) {
      attributes.push(meta);
    });

    Model.eachRelationship(function (name, rel) {
      attributes.push(rel);
    });

    return attributes;
  }.property('modelClass').readOnly()
});
