import Ember from 'ember';

export default Ember.ArrayController.extend({
  itemController: 'admin/model/base/record',
  sortProperties: ['label'],
  sortAscending:  true
});
