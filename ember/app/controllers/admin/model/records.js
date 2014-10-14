import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['admin/model/model'],

  itemController: 'admin/model/record',

  modelClass: Ember.computed.oneWay('controllers.admin/model/model.modelClass'),

  modelName: Ember.computed.oneWay('controllers.admin/model/model.name'),

  attributes: Ember.computed.oneWay('controllers.admin/model/model.attributes')
});
