import Ember from 'ember';

var WithGeoLocationMixin = Ember.Mixin.create({
  latitude:  Ember.required(),
  longitude: Ember.required(),
  geoExtra:  null,

  latLngString: function (key, value) {
    var match;
    if (arguments.length > 1) {
      if (value && (match = value.match(/^([0-9\.]+),([0-9\.]+)/))) {
        this.set('latLngObject', {lat: parseFloat(match[1]), lng: parseFloat(match[2])});
      }
      else {
        this.set('latLngObject', null);
      }
    }
    if (this.get('latitude') && this.get('longitude')) {
      return '%@,%@'.fmt(
        this.get('latitude'), this.get('longitude')
      );
    }
  }.property('latitude', 'longitude'),

  latLngObject: function (key, value) {
    var lat, lng, props = Object.create(null);
    if (arguments.length > 1) {
      if (value) {
        lat = value.latitude == null ? value.lat : value.latitude;
        lng = value.longitude == null ? value.lng : value.longitude;
      }
      if (lat == null || lng == null) {
        lat = null;
        lng = null;
      }
      if (this.get('latitude') !== lat) {
        props.latitude = lat;
      }
      if (this.get('longitude') !== lng) {
        props.longitude = lng;
      }
      this.setProperties(props);
    }
    else {
      lat = this.get('latitude');
      lng = this.get('longitude');
    }
    if (lat) {
      props.lat = props.latitude = lat;
      props.lng = props.longitude = lng;
    }
    else {
      props = undefined;
    }
    return props;
  }.property('latitude', 'longitude'),

  country: Ember.computed.any('geoExtra.country'),
  region:  Ember.computed.any('geoExtra.region', 'geoCity.administrativeRegion'),
  city:    Ember.computed.any('geoExtra.city', 'geoCity.locality')
});

export default WithGeoLocationMixin;
