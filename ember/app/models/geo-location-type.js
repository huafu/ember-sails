//import DS from 'ember-data';
import Ember from 'ember';
import GeoLocationTypeCore from './core/geo-location-type';

export default GeoLocationTypeCore.extend({
  recordLabel: Ember.computed.alias('label')
});
