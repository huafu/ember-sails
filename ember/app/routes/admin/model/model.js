import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function(){
    this.transitionTo('admin.model.records');
  },
  renderTemplate: function () {
    this.render({outlet: 'model'});
  }
});
