import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['admin/model'],

  itemController: 'record',

  modelClass: Ember.computed.oneWay('controllers.admin/model.modelClass'),

  attributes: Ember.computed.oneWay('controllers.admin/model.attributes')
});
