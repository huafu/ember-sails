require('../busybox');

var fs = require('fs');
var sysPath = require('path');

var str = require('../string');
var modelsConfig = require('../../../config/models').models;
var ModelAttribute = require('./ModelAttribute');

var MODELS_PATH = sysPath.resolve(sysPath.join(__dirname, '..', '..', 'models'));
var EMBER_MODELS_PATH = sysPath.resolve(sysPath.join(__dirname, '..', '..', '..', 'ember', 'app', 'models', 'core'));
var EMBER_TEMPLATE = 'import DS from \'ember-data\';\n\nexport default {{source}};\n';

var Class;
var Model = (function () {
  Model.prototype.name = null;

  Model.prototype.config = null;

  Model.prototype.attributesCache = null;

  /* jshint -W004 */
  function Model(name, config) {
    this.config = config;
    this.name = Class.baseName(name);
    this.attributesCache = {};
  }

  Model.prototype.getName = function () {
    return this.name;
  };

  Model.prototype.getAttribute = function (name) {
    var attr, def, _ref;
    if (this.attributesCache.hasOwnProperty(name)) {
      attr = this.attributesCache[name];
    }
    else {
      if ((def = this.config.attributes[name]) && typeof def !== 'function') {
        if (typeof def === 'string') {
          def = {
            type: def
          };
        }
        attr = new ModelAttribute(name, def);
      }
      else if (!def) {
        if ((name === 'createdAt' && modelsConfig.autoCreatedAt) || (name === 'updatedAt' && modelsConfig.autoUpdatedAt)) {
          attr = new ModelAttribute(name, {
            type:     'datetime',
            required: true
          });
        }
        else if (name === 'id' && ((_ref = this.config.autoPk) != null ? _ref : modelsConfig.autoPk)) {
          attr = new ModelAttribute(name, {
            primaryKey: true,
            required:   true
          });
        }
        else {
          attr = void 0;
        }
      }
      this.attributesCache[name] = attr;
    }
    return attr;
  };

  Model.prototype.getAllAttributes = function () {
    var attributes = [];
    var names = this.getAllAttributeNames();
    for (var i = 0; i < names.length; i++) {
      attributes.push(this.getAttribute(names[i]));
    }
    return attributes;
  };

  Model.prototype.getAllAttributeNames = function () {
    var autoPk, key, res, val, _ref;
    res = [];
    autoPk = (_ref = this.config.autoPk) != null ? _ref : modelsConfig.autoPk;
    if (autoPk) {
      res.push('id');
    }
    for (var key in this.config.attributes) {
      if (typeof this.config.attributes[key] !== 'function') {
        res.push(key);
      }
    }
    if (modelsConfig.autoCreatedAt) {
      res.push('createdAt');
    }
    if (modelsConfig.autoUpdatedAt) {
      res.push('updatedAt');
    }
    return res;
  };

  Model.prototype.getFilePath = function () {
    return Class.nameToFilePath(this.name);
  };

  Model.prototype.getEmberFilePath = function () {
    return Class.nameToEmberFilePath(this.name);
  };

  Model.prototype.toEmberDefinition = function (indent) {
    var all, attr, def, attributes;
    if (indent == null) {
      indent = '  ';
    }
    all = [];
    attributes = this.getAllAttributes();
    for (var i = 0; i < attributes.length; i++) {
      attr = attributes[i];
      if ((def = attr.toEmberDefinition())) {
        all.push(indent + attr.getName() + ': ' + def);
      }
    }
    return 'DS.Model.extend({\n' + all.join(',\n\n') + '\n})';
  };

  Model.prototype.writeEmberModelFile = function (override) {
    var exists, file;
    if (override == null) {
      override = true;
    }
    file = this.getEmberFilePath();
    exists = fs.existsSync(file);
    if (!override && exists) {
      fs.writeFileSync(file + '.orig', fs.readFileSync(file));
      console.log('  backing up `' + this.getName() + '` into `' + file + '.orig`');
    }
    console.info('* writing Ember model source for `' + this.getName() + '` into `' + file + '`');
    return fs.writeFileSync(file, str.interpolate(EMBER_TEMPLATE, {
      source: this.toEmberDefinition()
    }));
  };

  Model.dict = {};

  Model.factory = function (name) {
    var def, err, model, source;
    name = name[0].toLowerCase() + name.substr(1);
    if (this.dict.hasOwnProperty(name)) {
      model = this.dict[name];
    }
    else {
      source = this.nameToFilePath(name);
      try {
        def = require(source);
      }
      catch (_error) {
        err = _error;
        console.warn("error reading file for model `" + name + "`", err);
      }
      if (def) {
        model = new Class(name, def);
      }
      else {
        model = void 0;
      }
      this.dict[name] = model;
    }
    return model;
  };

  Model.baseName = function (name) {
    return str.decapitalize(str.classify(name));
  };

  Model.nameToFilePath = function (name, extension) {
    if (extension == null) {
      extension = '';
    }
    return sysPath.join(MODELS_PATH, str.capitalize(this.baseName(name))) + extension;
  };

  Model.nameToEmberFilePath = function (name, extension) {
    if (extension == null) {
      extension = '.js';
    }
    return sysPath.join(EMBER_MODELS_PATH, str.dasherize(this.baseName(name))) + extension;
  };

  Model.all = function () {
    var file, res = [], files;
    files = fs.readdirSync(MODELS_PATH);
    for (var i = 0; i < files.length; i++) {
      file = files[i];
      if (/\.(js|coffee)$/.test(file)) {
        res.push(this.factory(file.replace(/\.(js|coffee)$/, '')));
      }
    }
    return res;
  };

  return Model;

})();

Class = module.exports = Model;
