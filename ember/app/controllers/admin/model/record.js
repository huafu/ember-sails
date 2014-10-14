import Ember from 'ember';

export default Ember.ObjectController.extend({
  attributes: Ember.computed.oneWay('parentController.attributes')
});
