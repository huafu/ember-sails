import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    return this.store.findAll(this.modelFor('admin.model.model').name);
  },

  renderTemplate: function () {
    this.render({
      into:   'admin.model.models',
      outlet: 'records'
    });
  }
});
