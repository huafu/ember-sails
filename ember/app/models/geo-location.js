//import DS from 'ember-data';
import GeoLocationCore from './core/geo-location';

export default GeoLocationCore.extend({
  recordLabel: function () {
    return '%@,%@ (%@, source: %@)'.fmt(
      this.get('lat'), this.get('lng'), this.get('type.id'), this.get('source.id')
    );
  }.property('lat', 'lng', 'type', 'source').readOnly()
});
