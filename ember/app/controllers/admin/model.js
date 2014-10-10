import Ember from 'ember';

export default Ember.ObjectController.extend({
  modelClass: function () {
    return this.store.modelFor(this.get('model.name'));
  }.property('model.name').readOnly(),

  attributes: function () {
    var Model = this.get('modelClass');
    var attributes = [
      {name: 'id', type: 'string'}
    ];

    Model.eachAttribute(function (name) {
      attributes.push(Model.metaForProperty(name));
    });

    return attributes;
  }.property('modelClass').readOnly()
});
