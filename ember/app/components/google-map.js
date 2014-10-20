/* globals google */
import Ember from 'ember';

var _hasGoogleLib = null;
function hasGoogleLib() {
  if (_hasGoogleLib === null) {
    _hasGoogleLib = window.google && google.maps;
  }
  return _hasGoogleLib;
}

function makeObj() {
  var res = {};
  for (var i = 0; i < arguments.length; i += 2) {
    res[arguments[i]] = arguments[i + 1];
  }
  return res;
}

var helpers = {
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
    if (hasGoogleLib() && (name = helpers._typeMap[type])) {
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
      for (var k in helpers._typeMap) {
        if (helpers._typeMap.hasOwnProperty(k) && google.maps.MapTypeId[helpers._typeMap[k]] === type) {
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
      return new google.maps.LatLng(Number(lat), Number(lng));
    }
  },
  /**
   * Convert a google LatLng object to lat/lng
   * @param {google.maps.LatLng} obj
   * @returns {Array<Number>}
   */
  googleLatLngToLatLng: function (obj) {
    return [obj.lat(), obj.lng()];
  },

  _typeFromGoogle:   function (key, val) {
    if (arguments.length === 1) {
      val = key;
      key = null;
    }
    return makeObj(key || 'type', helpers.typeFromGoogleType(val));
  },
  _typeToGoogle:     function (key, obj) {
    if (arguments.length === 1) {
      obj = key;
      key = null;
    }
    return helpers.typeToGoogleType(obj[key || 'type']);
  },
  _latLngFromGoogle: function (latKey, lngKey, val) {
    if (arguments.length === 1) {
      val = latKey;
      latKey = null;
    }
    return makeObj(latKey || 'lat', val.lat(), lngKey || 'lng', val.lng());
  },
  _latLngToGoogle:   function (latKey, lngKey, obj) {
    if (arguments.length === 1) {
      obj = latKey;
      latKey = null;
    }
    return helpers.latLngToGoogleLatLng(obj[latKey || 'lat'], obj[lngKey || 'lng']);
  }
};

var GoogleObjectProperty = function (key, config) {
  var props = key.split(',');
  this._cfg = {
    key:        key,
    properties: props,
    name:       config.name || props.join('_').camelize(),
    toGoogle:   config.toGoogle || null,
    fromGoogle: config.fromGoogle || null,
    read:       config.read || null,
    write:      config.write || null,
    event:      config.event || null,
    cast:       config.cast || null
  };
};
GoogleObjectProperty.prototype.fromGoogleValue = function (value) {
  var val;
  if (this._cfg.fromGoogle) {
    val = this._cfg.fromGoogle.call(this, value);
  }
  else {
    val = makeObj(this._cfg.key, value);
  }
  return val;
};
GoogleObjectProperty.prototype.toGoogleValue = function (obj) {
  var val;
  if (this._cfg.toGoogle) {
    val = this._cfg.toGoogle.call(this, obj);
  }
  else {
    val = this._cfg.properties.length > 1 ? obj : obj[this._cfg.key];
    if (this._cfg.cast) {
      val = this._cfg.cast(val);
    }
  }
  return val;
};
GoogleObjectProperty.prototype.readGoogle = function (googleObject) {
  var val;
  if (this._cfg.read) {
    val = this._cfg.read.call(this, googleObject);
  }
  else {
    val = googleObject['get' + this._cfg.name.capitalize()]();
  }
  return this.fromGoogleValue(val);
};
GoogleObjectProperty.prototype.writeGoogle = function (googleObject, obj) {
  var val, p, diff = false,
    actual = this.readGoogle(googleObject);
  for (var i = 0; i < this._cfg.properties.length; i++) {
    p = this._cfg.properties[i];
    if ('' + obj[p] !== '' + actual[p]) {
      diff = true;
      break;
    }
  }
  if (!diff) {
    return;
  }
  val = this.toGoogleValue(obj);
  if (this._cfg.write) {
    this._cfg.write.call(this, googleObject, val);
  }
  else {
    googleObject['set' + this._cfg.name.capitalize()](val);
  }
};

GoogleObjectProperty.prototype.link = function (emberObject, googleObject) {
  Ember.warn('linking a google object property but it has not been unlinked first', !this._listeners);
  if (emberObject && googleObject) {
    this._listeners = {
      ember:  function () {
        var obj = emberObject.getProperties(this._cfg.properties);
        //console.warn('setting GOOGLE', obj);
        this.writeGoogle(googleObject, obj);
      },
      google: Ember.run.bind(this, function () {
        var p, diff = true,
          obj = this.readGoogle(googleObject),
          actual = emberObject.getProperties(this._cfg.properties);
        for (var i = 0; i < this._cfg.properties.length; i++) {
          p = this._cfg.properties[i];
          if ('' + obj[p] !== '' + actual[p]) {
            diff = true;
            break;
          }
        }
        if (!diff) {
          return;
        }
        //console.warn('setting EMBER', obj);
        emberObject.setProperties(obj);
      })
    };
    if (this._cfg.event) {
      googleObject.addListener(this._cfg.event, this._listeners.google);
    }
    this._cfg.properties.forEach(function (name) {
      emberObject.addObserver(name, this, this._listeners.ember);
    }, this);
  }
};
GoogleObjectProperty.prototype.unlink = function (emberObject, googleObject) {
  if (this._listeners) {

    if (this._cfg.event) {
      googleObject.removeListener(this._cfg.event, this._listeners.google);
    }
    this._cfg.properties.forEach(function (name) {
      emberObject.removeObserver(name, this, this._listeners.ember);
    }, this);
    this._listeners = null;
  }
};
GoogleObjectProperty.prototype.toOptions = function (source, options) {
  var val = this.toGoogleValue(source.getProperties(this._cfg.properties));
  if (val !== undefined) {
    options[this._cfg.name] = val;
  }
};

var GoogleObjectMixin = Ember.Mixin.create({
  googleProperties:    Ember.required(),
  googleObject:        null,
  /**
   * @property _compiledDefinition
   * @type Array<Object>
   */
  _compiledDefinition: function () {
    var def = this.get('googleProperties') || {},
      res = [], d;
    for (var k in def) {
      if (def.hasOwnProperty(k)) {
        d = def[k];
        if (typeof d === 'string') {
          d = {name: d};
        }
        else if (d === true) {
          d = {};
        }
        res.push(new GoogleObjectProperty(k, d));
        d = null;
      }
    }
    return res;
  }.property().readOnly(),

  serializeGoogleOptions: function () {
    var i, res = {}, def = this.get('_compiledDefinition');
    for (i = 0; i < def.length; i++) {
      def[i].toOptions(this, res);
    }
    return res;
  },

  unlinkGoogleObject: function () {
    var old = this.cacheFor('googleObject');
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


var GoogleMapMarkerController = Ember.ObjectController.extend(GoogleObjectMixin, {
  googleProperties: {
    isClickable: { name: 'clickable' },
    isVisible:   { name: 'visible', event: 'visible_changed' },
    title:       { event: 'title_changed' },
    opacity:     { cast: Number },
    icon:        true,
    map:         true,
    'lat,lng':   {
      name:       'position',
      event:      'position_changed',
      toGoogle:   helpers._latLngToGoogle,
      fromGoogle: helpers._latLngFromGoogle
    }
  },

  map: Ember.computed.oneWay('parentController.map'),

  googleObject: function (key, value) {
    var opt, go;
    if (arguments.length >= 2) {
      if ((go = this.cacheFor('googleObject'))) {
        go.setMap(null);
      }
    }
    else {
      if (hasGoogleLib()) {
        opt = this.serializeGoogleOptions();
        Ember.debug('[google-maps] creating new marker: %@'.fmt(opt));
        value = new google.maps.Marker(opt);
      }
    }
    return value;
  }.property(),

  initGoogleMarker: function () {
    Ember.run.next(this, 'get', 'googleObject');
  }.on('init')
});

var GoogleMapMarkersController = Ember.ArrayController.extend({
  itemController: 'google-map/marker',
  container:      Ember.computed.oneWay('mapComponent.container'),
  map:            Ember.computed.oneWay('mapComponent.googleObject'),
  model:          Ember.computed.oneWay('mapComponent.markers')
});


var GoogleMapComponent = Ember.Component.extend(GoogleObjectMixin, {
  googleProperties: {
    zoom:      { event: 'zoom_changed', cast: Number },
    type:      {
      name:       'mapTypeId',
      event:      'maptypeid_changed',
      toGoogle:   helpers._typeToGoogle,
      fromGoogle: helpers._typeFromGoogle
    },
    'lat,lng': {
      name:       'center',
      event:      'center_changed',
      toGoogle:   helpers._latLngToGoogle,
      fromGoogle: helpers._latLngFromGoogle
    }
  },

  /**
   * @property googleObject
   * @type google.maps.Map
   * @private
   */
  googleObject: null,
  /**
   * @property lat
   * @type Number
   */
  lat:          0,
  /**
   * @property lng
   * @type Number
   */
  lng:          0,
  /**
   * @property zoom
   * @type Number
   * @default 5
   */
  zoom:         5,

  /**
   * @property type
   * @type String
   * @enum ['road', 'hybrid', 'terrain', 'satellite']
   * @default 'road'
   */
  type: 'road',

  markers: null,

  _markers: function () {
    return GoogleMapMarkersController.create({
      mapComponent: this
    });
  }.property().readOnly(),


  initGoogleMap: function () {
    var canvas, opt, map;
    this.destroyGoogleMap();
    if (hasGoogleLib()) {
      canvas = this.$('div.map-canvas')[0];
      opt = this.serializeGoogleOptions();
      Ember.debug('[google-map] creating map with options: %@'.fmt(opt));
      map = new google.maps.Map(canvas, opt);
      this.set('googleObject', map);
    }
  }.on('didInsertElement'),

  destroyGoogleMap: function () {
    if (this.get('googleObject')) {
      Ember.debug('[google-map] destroying map');
      this.set('googleObject', null);
    }
  }.on('willDestroyElement')
});

helpers.GoogleMapMarkerController = GoogleMapMarkerController;
helpers.GoogleMapMarkersController = GoogleMapMarkersController;
GoogleMapComponent.reopenClass(helpers);

export default GoogleMapComponent;
