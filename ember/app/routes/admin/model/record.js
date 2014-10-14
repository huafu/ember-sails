import Ember from 'ember';

export default Ember.Route.extend({
  model: function (params) {
    return this.store.find(this.modelFor('admin.model.model').name, params.id);
  },

  renderTemplate: function () {
    this.render({
      into:   'admin.model.models',
      outlet: 'records'
    });
  }
});
