/* globals google */
import Ember from 'ember';

function hasGoogleLib() {
  return (window.google && google.maps);
}

var GoogleOptions = Ember.Object.extend({
  _map: null,
  zoom: null,
  lat:  null,
  lng:  null,
  type: null,

  zoomDidChange: function () {
    if (this._map) {
      Ember.run.once(this, 'writeZoom');
    }
  }.observes('zoom'),

  typeDidChange: function () {
    if (this._map) {
      Ember.run.once(this, 'writeType');
    }
  }.observes('type'),

  centerDidChange: function () {
    if (this._map) {
      Ember.run.once(this, 'writeCenter');
    }
  }.observes('lat', 'lng'),

  _eventMap: function () {
    return {
      center_changed:    Ember.run.bind(this, 'readCenter'),
      maptypeid_changed: Ember.run.bind(this, 'readType'),
      zoom_changed:      Ember.run.bind(this, 'readZoom')
    };
  }.property().readOnly(),

  attachMap: function (map) {
    var events;
    if (this._map !== map) {
      this.detachMap();
      this._map = map;
      events = this.get('_eventMap');
      for (var k in events) {
        if (events.hasOwnProperty(k)) {
          map.addListener(k, events[k]);
        }
      }
    }
  },

  detachMap: function () {
    var events;
    if (this._map) {
      events = this.get('_eventMap');
      for (var k in events) {
        if (events.hasOwnProperty(k)) {
          this._map.removeListener(k, events[k]);
        }
      }
      this._map = null;
    }
  },

  toObject:    function () {
    var opt = {}, v;
    if ((v = GoogleMapComponent.latLngToGoogleLatLng(this.get('lat'), this.get('lng')))) {
      opt.center = v;
    }
    if ((v = this.get('type'))) {
      opt.mapTypeId = v;
    }
    if ((v = this.get('zoom'))) {
      opt.zoom = v;
    }
    return opt;
  },
  readZoom:    function (map) {
    map = map || this._map;
    var v;
    if (map && (v = map.getZoom()) !== this.get('zoom')) {
      this.set('zoom', v);
    }
  },
  writeZoom:   function (map) {
    map = map || this._map;
    var v = this.get('zoom');
    if (map && v && map.getZoom() !== v) {
      Ember.run.once(map, 'setZoom', v);
    }
  },
  readType:    function (map) {
    map = map || this._map;
    var v;
    if (map && (v = GoogleMapComponent.typeFormGoogleType(map.getMapTypeId())) !== this.get('type')) {
      this.set('type', v);
    }
  },
  writeType:   function (map) {
    map = map || this._map;
    var v = GoogleMapComponent.typeToGoogleType(this.get('type'));
    if (map && v && map.getMapTypeId() !== v) {
      Ember.run.once(map, 'setMapTypeId', v);
    }
  },
  readCenter:  function (map) {
    map = map || this._map;
    var lat, lng, v;
    if (map && (v = map.getCenter()) && (lat = v.lat) && (lng = v.lng) &&
      (lat !== this.get('lat') || lng !== this.get('lng'))) {
      this.setProperties({ lat: lat, lng: lng });
    }
  },
  writeCenter: function (map) {
    map = map || this._map;
    var v, lat = this.get('lat'), lng = this.get('lng');
    if (map && lat != null && lng != null && (v = map.getCenter()) &&
      (v.lat !== lat || v.lng !== lng)) {
      Ember.run.once(map, 'setCenter', GoogleMapComponent.latLngToGoogleLatLng(lat, lng));
    }
  }
});

var GoogleMapComponent = Ember.Component.extend({
  /**
   * @property _map
   * @type google.maps.Map
   * @private
   */
  _map:      null,
  /**
   * @property _options
   * @private
   * @type GoogleOptions
   */
  _options:  function () {
    return GoogleOptions.create();
  }.property(),
  /**
   * @property centerLat
   * @type Number
   */
  centerLat: Ember.computed.alias('_options.lat'),
  /**
   * @property centerLng
   * @type Number
   */
  centerLng: Ember.computed.alias('_options.lng'),

  /**
   * @property zoom
   * @type Number
   * @default 17
   */
  zoom: Ember.computed.alias('_options.zoom'),

  /**
   * @property type
   * @type String
   * @enum ['road', 'hybrid', 'terrain', 'satellite']
   * @default 'read'
   */
  type: Ember.computed.alias('_options.type'),


  initGoogleMap: function () {
    var canvas, opt;
    if (hasGoogleLib()) {
      canvas = this.$('div.map-canvas')[0];
      opt = this.get('_options');
      this._map = new google.maps.Map(canvas, opt.toObject());
      opt.attachMap(this._map);
    }
  }.on('didInsertElement'),

  destroyGoogleMap: function () {
    if (this._map) {
      this.get('_options').detachMap();
      this._map = null;
    }
  }.on('willDestroyElement')
});


GoogleMapComponent.reopenClass({
  TYPE_ROAD:      'road',
  TYPE_TERRAIN:   'terrain',
  TYPE_HYBRID:    'hybrid',
  TYPE_SATELLITE: 'satellite',

  _typeMap:             {
    road:      'ROADMAP',
    terrain:   'TERRAIN',
    hybrid:    'HYBRID',
    satellite: 'SATELLITE'
  },
  /**
   * Convert our type to the google one
   * @param {String} type
   * @returns {Number}
   */
  typeToGoogleType:     function (type) {
    var name;
    if (hasGoogleLib() && (name = this._typeMap[type])) {
      return google.maps.MapTypeId[name];
    }
  },
  /**
   * Convert google map type to our type
   * @param {Number} type
   * @returns {string}
   */
  typeFromGoogleType:   function (type) {
    if (hasGoogleLib() && type) {
      for (var k in this._typeMap) {
        if (this._typeMap.hasOwnProperty(k) && this._typeMap[k] === type) {
          return k;
        }
      }
    }
  },
  /**
   * Convert a lat/lng pair to a google one
   * @param {Number} lat
   * @param {Number} lng
   * @returns {google.maps.LatLng}
   */
  latLngToGoogleLatLng: function (lat, lng) {
    if (lat != null && lng != null && hasGoogleLib()) {
      return new google.maps.LatLng(lat, lng);
    }
  }
});

export default GoogleMapComponent;
