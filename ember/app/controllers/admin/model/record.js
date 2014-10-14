import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['admin/model/model'],

  modelClass: Ember.computed.oneWay('controllers.admin/model/model.modelClass'),

  modelName: Ember.computed.oneWay('controllers.admin/model/model.name'),

  attributes: Ember.computed.oneWay('controllers.admin/model/model.attributes')
});
