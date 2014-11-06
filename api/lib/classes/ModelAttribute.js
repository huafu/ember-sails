var Class;

var TYPE_MAP = {
  datetime:     'date',
  integer:      'number',
  float:        'number',
  email:        'string',
  alphanumeric: 'string',
  url:          'string'
};

var ModelAttribute = (function () {
  ModelAttribute.prototype.name = null;

  ModelAttribute.prototype.config = null;

  /* jshint -W004 */
  function ModelAttribute(name, config) {
    this.name = name;
    this.config = config;
  }

  ModelAttribute.prototype.isPrimaryKey = function () {
    return this.config.primaryKey;
  };

  ModelAttribute.prototype.isRelationship = function () {
    return Boolean(this.config.model || this.config.collection);
  };

  ModelAttribute.prototype.isAttribute = function () {
    return !this.isRelationship() && !this.isPrimaryKey();
  };

  ModelAttribute.prototype.getName = function () {
    return this.name;
  };

  ModelAttribute.prototype.getDefaultValue = function () {
    return this.config.defaultsTo;
  };

  ModelAttribute.prototype.getRelationshipModelName = function () {
    var name;
    if ((name = this.config.model || this.config.collection)) {
      return require('./Model').baseName(name);
    }
  };

  ModelAttribute.prototype.getRelationshipKind = function () {
    if (this.isRelationship()) {
      if (this.config.model) {
        return 'belongsTo';
      }
      else {
        return 'hasMany';
      }
    }
  };

  ModelAttribute.prototype.getRelationshipInverse = function () {
    return this.config.via;
  };

  ModelAttribute.prototype.toEmberDefinition = function () {
    var attr, def, inv;
    if (this.config.protected) {
      return void 0;
    }
    else if (this.isAttribute()) {
      attr = ["'" + (Class.waterlineTypeToEmberType(this.config.type) || 'string') + "'"];
      if ((def = this.getDefaultValue()) !== void 0) {
        attr.push("{defaultValue: " + (JSON.stringify(def)) + "}");
      }
      return "DS.attr(" + (attr.join(', ')) + ")";
    }
    else if (this.isRelationship()) {
      attr = ["'" + (this.getRelationshipModelName()) + "'"];
      if ((inv = this.getRelationshipInverse())) {
        attr.push("{inverse: '" + inv + "'}");
      }
      return "DS." + (this.getRelationshipKind()) + "(" + (attr.join(', ')) + ")";
    }
  };

  ModelAttribute.waterlineTypeToEmberType = function (type) {
    return TYPE_MAP[type] || type;
  };

  return ModelAttribute;

})();

Class = module.exports = ModelAttribute;
