//import DS from 'ember-data';
import Ember from 'ember';
import GeoLocationSourceCore from './core/geo-location-source';

export default GeoLocationSourceCore.extend({
  recordLabel: Ember.computed.alias('label')
});
