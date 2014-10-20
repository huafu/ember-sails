/* globals google */
import Ember from 'ember';

function hasGoogleLib() {
  return (window.google && google.maps);
}

var GoogleObjectMixin = Ember.mixin.create({
  _definition:         Ember.required(),
  _googleObject:       null,
  /**
   * @property _compiledDefinition
   * @type Array<Object>
   */
  _compiledDefinition: function () {
    var def = this.get('_definition') || {},
      prop, makeReader, makeWriter, res, item, link, unlink,
      emberToGoogle, googleToEmber;

    makeReader = function (props, cb) {
      if (props.length > 1 && !cb) {
        throw new TypeError('you must define the reader for %@'.fmt(props));
      }
      return cb || function (source) {
        var r = {};
        r[props[0]] = source['get' + props[0].capitalize()];
        return r;
      };
    };
    makeWriter = function (props, cb) {
      if (props.length > 1 && !cb) {
        throw new TypeError('you must define the writer for %@'.fmt(props));
      }
      return  cb || function (source, values) {
        return source['set' + props[0].capitalize()](values[props[0]]);
      };
    };

    link = function (emberObject, googleObject) {
      emberObject.addObserver(item.properties, this, 'emberToGoogle');
      if (this.event) {
        googleObject.addListener(this.event, this.googleToEmber);
      }
    };
    unlink = function (emberObject, googleObject) {
      emberObject.removeObserver(item.properties, this, 'emberToGoogle');
      if (this.event) {
        googleObject.removeListener(this.event, this.googleToEmber);
      }
    };
    googleToEmber = function () {
      var google, ember, props, set = {}, g = this.owner.get('_googleObject');
      if (g) {
        ember = this.owner.getProperties(this.properties);
        google = item.read(g);
        props = Ember.keys(ember).concat(Ember.keys(google)).uniq();
        for (var i = 0; i <= props.length; i++) {
          if (google[props[i]] !== ember[props[i]]) {
            set[props[i]] = google[i];
          }
        }
        this.owner.setProperties(set);
      }
    };
    googleToEmber.bound = function () {
      Ember.run.once(this, googleToEmber);
    };
    emberToGoogle = function () {
      var google, ember, props, set = false, g = this.owner.get('_googleObject');
      if (g) {
        ember = this.owner.getProperties(this.properties);
        google = item.read(g);
        props = Ember.keys(ember).concat(Ember.keys(google)).uniq();
        for (var i = 0; i <= props.length; i++) {
          if (google[props[i]] !== ember[props[i]]) {
            set = true;
            break;
          }
        }
        this.write(g, ember);
      }
    };
    emberToGoogle.bound = function () {
      Ember.run.once(this, emberToGoogle);
    };
    res = [];
    for (var k in def) {
      if (def.hasOwnProperty(k)) {
        prop = def[k];
        item = { owner: this };
        item.properties = k.split(',');
        item.event = prop.event || null;
        item.read = makeReader(item.properties, prop.read);
        item.write = makeWriter(item.properties, prop.write);
        item.link = link;
        item.unlink = unlink;
        item.emberToGoogle = emberToGoogle.bound;
        item.googleToEmber = googleToEmber.bound.bind(item);
        res.push(item);
      }
    }
    return res;
  }.property().readOnly(),

  unlinkGoogleObject: function () {
    var old = this.get('_googleObject');
    if (old) {
      this.get('_compiledDefinition').invoke('unlink', this, old);
    }
  }.observesBefore('_googleObject'),

  linkGoogleObject: function () {
    var obj = this.get('_googleObject');
    if (obj) {
      this.get('_compiledDefinition').invoke('link', this, obj);
    }
  }.observes('_googleObject'),

  destroyGoogleObject: function () {
    var def = this.get('_compiledDefinition');
    this.set('_googleObject', null);
    def.map(function(item){
      item.owner = null;
    });
    def.clear();
  }.on('destroy')
});

var GoogleMapOptions = Ember.Object.extend({
  _map: null,
  zoom: 6,
  lat:  0,
  lng:  0,
  type: 'road',

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

  _log: function () {
    Ember.debug('map settings: %@'.fmt(this.serialize()));
  }.observes('lat', 'lng', 'zoom', 'type').on('init'),

  attachMap: function (map) {
    var events;
    if (this._map !== map) {
      Ember.debug('[google-map][options] attaching map');
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
      Ember.debug('[google-map][options] detaching map');
      events = this.get('_eventMap');
      for (var k in events) {
        if (events.hasOwnProperty(k)) {
          this._map.removeListener(k, events[k]);
        }
      }
      this._map = null;
    }
  },

  serialize: function () {
    return this.getProperties('lat', 'lng', 'zoom', 'type');
  },

  toGoogleOptions: function () {
    var opt = {}, v;
    if ((v = GoogleMapComponent.latLngToGoogleLatLng(this.get('lat'), this.get('lng')))) {
      opt.center = v;
    }
    if ((v = this.get('type'))) {
      opt.mapTypeId = GoogleMapComponent.typeToGoogleType(v);
    }
    if ((v = this.get('zoom'))) {
      opt.zoom = v;
    }
    return opt;
  },
  readZoom:        function (map) {
    map = map || this._map;
    var v;
    if (map && (v = map.getZoom()) !== this.get('zoom')) {
      this.set('zoom', v);
    }
  },
  writeZoom:       function (map) {
    map = map || this._map;
    var v = this.get('zoom');
    if (map && v && map.getZoom() !== v) {
      Ember.run.once(map, 'setZoom', v);
    }
  },
  readType:        function (map) {
    map = map || this._map;
    var v;
    if (map && (v = GoogleMapComponent.typeFormGoogleType(map.getMapTypeId())) !== this.get('type')) {
      this.set('type', v);
    }
  },
  writeType:       function (map) {
    map = map || this._map;
    var v = GoogleMapComponent.typeToGoogleType(this.get('type'));
    if (map && v && map.getMapTypeId() !== v) {
      Ember.run.once(map, 'setMapTypeId', v);
    }
  },
  readCenter:      function (map) {
    map = map || this._map;
    var lat, lng, v;
    if (map && (v = map.getCenter()) && (lat = v.lat()) && (lng = v.lng()) &&
      (lat !== this.get('lat') || lng !== this.get('lng'))) {
      this.setProperties({ lat: lat, lng: lng });
    }
  },
  writeCenter:     function (map) {
    map = map || this._map;
    var v, lat = this.get('lat'), lng = this.get('lng');
    if (map && lat != null && lng != null && (v = map.getCenter()) &&
      (v.lat() !== lat || v.lng() !== lng)) {
      Ember.run.once(map, 'setCenter', GoogleMapComponent.latLngToGoogleLatLng(lat, lng));
    }
  }
});

var GoogleMapMarkerController = Ember.ObjectController.extend({
  toGoogleOptions: function () {
    var opt;
    if (hasGoogleLib()) {
      opt = {};
      if (this.get('clickable'))
        }
    }
  });

var GoogleMapMarkersController = Ember.ArrayController.extend({
  itemController: GoogleMapMarkerController,

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
   * @type GoogleMapOptions
   */
  _options:  function () {
    return GoogleMapOptions.create();
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
   * @default 'road'
   */
  type: Ember.computed.alias('_options.type'),


  initGoogleMap: function () {
    var canvas, opt;
    if (hasGoogleLib()) {
      canvas = this.$('div.map-canvas')[0];
      opt = this.get('_options');
      Ember.debug('[google-map] creating map with options: %@'.fmt(opt.serialize()));
      console.log(opt.toGoogleOptions());
      this._map = new google.maps.Map(canvas, opt.toGoogleOptions());
      opt.attachMap(this._map);
    }
  }.on('didInsertElement'),

  destroyGoogleMap: function () {
    if (this._map) {
      Ember.debug('[google-map] destroying map');
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
   * @returns {String}
   */
  typeToGoogleType:     function (type) {
    var name;
    if (hasGoogleLib() && (name = this._typeMap[type])) {
      return google.maps.MapTypeId[name];
    }
  },
  /**
   * Convert google map type to our type
   * @param {String} type
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
