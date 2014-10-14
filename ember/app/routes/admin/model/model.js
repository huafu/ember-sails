import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function () {
    this.render({outlet: 'model'});
  },

  actions: {
    gotoRecord: function (type, id) {
      if (arguments.length === 1) {
        id = type;
        type = this.controllerFor('admin.model.model').get('name');
      }
      this.transitionTo('admin.model.record', type, id);
    }
  }
});
