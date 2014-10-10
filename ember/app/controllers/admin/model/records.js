import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['admin/model'],

  modelClass: Ember.computed.oneWay('controllers.admin/model.modelClass'),

  attributes: Ember.computed.oneWay('controllers.admin/model.attributes')
});
