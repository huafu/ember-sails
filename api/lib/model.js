var hasProp = {}.hasOwnProperty;

var str = require('./string');

var modelConstructorCache = {

  _index: null,
  index:  function () {
    var model, name, _ref;
    if (!this._index) {
      this._index = {
        constructors: [],
        models:       []
      };
      _ref = sails.models;
      for (name in _ref) {
        if (hasProp.call(_ref, name)) {
          model = _ref[name];
          this._index.constructors.push(model._model.__bindData__[0]);
          this._index.models.push(model);
        }
      }
    }
    return this._index;
  },

  modelForConstructor: function (constructor) {
    var i, idx;
    idx = this.index();
    if ((i = idx.constructors.indexOf(constructor)) >= 0) {
      return idx.models[i];
    }
  }
};

var self = module.exports = {

  forName: function (name) {
    return sails.models[name.replace(/[_\.-]/g, '').toLowerCase()];
  },

  forRecord: function (record) {
    return modelConstructorCache.modelForConstructor(record.constructor);
  },

  for: function (item) {
    var name;
    if (_.isString(item)) {
      return self.forName(item);
    }
    else if (item && (name = item.globalId) != null) {
      return self.forName(name);
    }
    else if (_.isObject(item)) {
      return self.forRecord(item);
    }
    else {
      throw new ReferenceError('cannot get the model for ' + item);
    }
  },

  nameFor: function (item) {
    return self.for(item).globalId;
  },

  primaryKeyNameFor: function (item) {
    return self.for(item).primaryKey;
  },

  addGeoAttributes: function (required, attributes) {
    if (attributes == null) {
      attributes = {};
    }
    if (typeof required === 'object') {
      attributes = required;
      required = false;
    }
    attributes.latitude = {
      required: required ? true : false,
      type:     'float'
    };
    attributes.longitude = {
      required: required ? true : false,
      type:     'float'
    };
    attributes.geoExtra = {
      type: 'json'
    };
    return attributes;
  },


  attributes: {

    gender: function (extension) {
      return _.merge({
        type:   'string',
        "enum": ['male', 'female', 'business', 'group']
      }, extension || {});
    },

    pkCode: function (extension) {
      return _.merge({
        type:       'string',
        size:       32,
        required:   true,
        primaryKey: true
      }, extension || {});
    }

  }
};
