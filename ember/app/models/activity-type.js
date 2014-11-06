import Ember from 'ember';
import ActivityTypeCore from './core/activity-type';

export default ActivityTypeCore.extend({
  recordLabel: Ember.computed.alias('label')
});
