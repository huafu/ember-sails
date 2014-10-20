/* globals google */
import Ember from 'ember';

var _hasGoogleLib = null;
function hasGoogleLib() {
  if (_hasGoogleLib === null) {
    _hasGoogleLib = window.google && google.maps;
  }
  return _hasGoogleLib;
}

var GoogleObjectMixin = Ember.Mixin.create({
  googleProperties:    Ember.required(),
  googleObject:        null,
  /**
   * @property _compiledDefinition
   * @type Array<Object>
   */
  _compiledDefinition: function () {
    var def = this.get('googleProperties') || {},
      prop, makeReader, makeWriter, res, item, link, unlink,
      emberToGoogle, googleToEmber, makeToOptions, makeRunOnce;

    makeToOptions = function (props, callback) {
      var cb = callback;
      if (props.length > 1) {
        if (!cb) {
          throw new TypeError('you must define the option injector for %@'.fmt(props));
        }
      }
      else if (typeof cb === 'string') {
        cb = function (options, values) {
          options[callback] = values[props[0]];
        };
      }
      else if (cb !== false) {
        cb = function (options, values) {
          options[props[0]] = values[props[0]];
        };
      }
      else {
        cb = Ember.K;
      }
      return cb;
    };
    makeReader = function (props, callback) {
      var cb = callback;
      if (props.length > 1) {
        if (!cb) {
          throw new TypeError('you must define the reader for %@'.fmt(props));
        }
      }
      else if (cb) {
        cb = function (source) {
          var r = {};
          r[props[0]] = callback.apply(this, [source]);
          return r;
        };
      }
      else {
        cb = function (source) {
          var r = {};
          r[props[0]] = source['get' + props[0].capitalize()]();
          return r;
        };
      }
      return cb;
    };
    makeWriter = function (props, callback) {
      var cb = callback;
      if (props.length > 1) {
        if (!cb) {
          throw new TypeError('you must define the writer for %@'.fmt(props));
        }
      }
      else if (cb) {
        cb = function (source, values) {
          return callback.apply(this, [source, values[props[0]]]);
        };
      }
      else {
        cb = function (source, values) {
          return source['set' + props[0].capitalize()](values[props[0]]);
        };
      }
      return  cb;
    };

    link = function (emberObject, googleObject) {
      emberObject.addObserver(this.properties, this, 'emberToGoogle');
      if (this.event) {
        googleObject.addListener(this.event, this.googleToEmber);
      }
    };
    unlink = function (emberObject, googleObject) {
      emberObject.removeObserver(this.properties, this, 'emberToGoogle');
      if (this.event) {
        googleObject.removeListener(this.event, this.googleToEmber);
      }
    };
    googleToEmber = function (item) {
      var google, ember, props, set = {}, g = this.get('googleObject');
      if (g) {
        ember = this.getProperties(item.properties);
        google = item.read(g);
        props = Ember.keys(ember).concat(Ember.keys(google)).uniq();
        for (var i = 0; i <= props.length; i++) {
          if (google[props[i]] !== ember[props[i]]) {
            set[props[i]] = google[props[i]];
          }
        }
        //console.log(set);
        this.setProperties(set);
      }
    };
    emberToGoogle = function (item) {
      var google, ember, props, set = false, g = this.get('googleObject');
      if (g) {
        ember = this.getProperties(item.properties);
        google = item.read(g);
        props = Ember.keys(ember).concat(Ember.keys(google)).uniq();
        for (var i = 0; i <= props.length; i++) {
          if (google[props[i]] !== ember[props[i]]) {
            set = true;
            break;
          }
        }
        item.write(g, ember);
      }
    };
    makeRunOnce = function () {
      var args = [].slice.call(arguments);
      return function () {
        Ember.run.once.apply(Ember.run, args);
      };
    };
    res = [];
    for (var k in def) {
      if (def.hasOwnProperty(k)) {
        prop = def[k];
        item = {};
        item.properties = k.split(',');
        item.event = prop.event || null;
        item.toOptions = makeToOptions(item.properties, prop.toOptions);
        item.read = makeReader(item.properties, prop.read);
        item.write = makeWriter(item.properties, prop.write);
        item.link = link;
        item.unlink = unlink;
        item.emberToGoogle = makeRunOnce(this, emberToGoogle, item);
        item.googleToEmber = makeRunOnce(this, googleToEmber, item);
        res.push(item);
        item = null;
      }
    }
    return res;
  }.property().readOnly(),

  serializeGoogleOptions: function () {
    var res = {}, def = this.get('_compiledDefinition');
    for (var i = 0; i < def.length; i++) {
      def[i].toOptions.call(this, res, this.getProperties(def[i].properties));
    }
    return res;
  },

  unlinkGoogleObject: function () {
    var old = this.get('googleObject');
    if (old) {
      this.get('_compiledDefinition').invoke('unlink', this, old);
    }
  }.observesBefore('googleObject'),

  linkGoogleObject: function () {
    var obj = this.get('googleObject');
    if (obj) {
      this.get('_compiledDefinition').invoke('link', this, obj);
    }
  }.observes('googleObject'),

  destroyGoogleObject: function () {
    this.set('googleObject', null);
    this.get('_compiledDefinition').clear();
  }.on('destroy')
});


var GoogleMapMarkerController = Ember.ObjectController.extend({
  map:  Ember.computed.oneWay('parentController.map'),
  init: function () {
    this._super.apply(this, arguments);
    console.log('parent:', this.get('parentController'));
    console.log('parent.parent:', this.get('parentController.parentController'));
  }
});

var GoogleMapMarkersController = Ember.ArrayController.extend({
  itemController: GoogleMapMarkerController,
  map:            Ember.computed.oneWay('parentController.googleObject'),
  content:        Ember.computed.oneWay('parentController.markers')
});


var GoogleMapComponent = Ember.Component.extend(GoogleObjectMixin, {
  googleProperties: {
    zoom:      { event: 'zoom_changed' },
    type:      {
      event:     'maptypeid_changed',
      toOptions: function (options, val) {
        options.mapTypeId = GoogleMapComponent.typeToGoogleType(val.type);
      },
      read:      function (source) {
        return GoogleMapComponent.typeFromGoogleType(source.getMapTypeId());
      },
      write:     function (source, val) {
        source.setMapTypeId(GoogleMapComponent.typeToGoogleType(val));
      }
    },
    'lat,lng': {
      event:     'center_changed',
      toOptions: function (options, val) {
        options.center = GoogleMapComponent.latLngToGoogleLatLng(val.lat, val.lng);
      },
      read:      function (source) {
        var c = source.getCenter();
        return { lat: c.lat(), lng: c.lng() };
      },
      write:     function (source, val) {
        source.setCenter(GoogleMapComponent.latLngToGoogleLatLng(val.lat, val.lng));
      }
    }
  },
  /**
   * @property googleObject
   * @type google.maps.Map
   * @private
   */
  googleObject:     null,
  /**
   * @property lat
   * @type Number
   */
  lat:              0,
  /**
   * @property lng
   * @type Number
   */
  lng:              0,

  /**
   * @property zoom
   * @type Number
   * @default 5
   */
  zoom: 5,

  /**
   * @property type
   * @type String
   * @enum ['road', 'hybrid', 'terrain', 'satellite']
   * @default 'road'
   */
  type: 'road',

  markers: [
    {},
    {}
  ],

  _markers: function () {
    return new GoogleMapMarkersController({
      parentController: this
    });
  }.property().readOnly(),


  initGoogleMap: function () {
    var canvas, opt;
    this.destroyGoogleMap();
    if (hasGoogleLib()) {
      canvas = this.$('div.map-canvas')[0];
      opt = this.serializeGoogleOptions();
      Ember.debug('[google-map] creating map with options: %@'.fmt(opt));
      this.set('googleObject', new google.maps.Map(canvas, opt));
    }
  }.on('didInsertElement'),

  destroyGoogleMap: function () {
    if (this.get('googleObject')) {
      Ember.debug('[google-map] destroying map');
      this.set('googleObject', null);
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
        if (this._typeMap.hasOwnProperty(k) && google.maps.MapTypeId[this._typeMap[k]] === type) {
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
