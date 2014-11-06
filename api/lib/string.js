var arraySlice = [].slice;

var self = module.exports = {
  /**
   * Dasherize the given string
   *
   * @method dasherize
   * @param {String} str
   * @param {String} [dash='-']
   * @returns {String}
   */
  dasherize: function (str, dash) {
    if (dash == null) {
      dash = '-';
    }
    return str.replace(/[A-Z]+/g, function (char) {
      return dash + char.toLowerCase();
    });
  },

  /**
   * Camelize the given string
   *
   * @method camelize
   * @param {String} str
   * @returns {String}
   */
  camelize: function (str) {
    return str.replace(/^[A-Z]/, function (str) {
      return (str != null ? str : '').toLowerCase();
    }).replace(/[_\.\-]([a-z])?/g, function (all, char) {
      return (char != null ? char : '').toUpperCase();
    });
  },

  /**
   * Capitalize the given string
   *
   * @method capitalize
   * @param {String} str
   * @returns {string}
   */
  capitalize: function (str) {
    return str[0].toUpperCase() + str.substr(1);
  },

  /**
   * Classify the given string
   *
   * @method classify
   * @param {String} str
   * @returns {string}
   */
  classify: function (str) {
    return self.capitalize(self.camelize(str));
  },

  /**
   * De-capitalize the given string
   *
   * @method decapitalize
   * @param {String} str
   * @returns {string}
   */
  decapitalize: function (str) {
    return str[0].toLowerCase() + str.substr(1);
  },

  /**
   * Formats a string using `%@[#]` and given array of values to bind
   *
   * @method fmt
   * @param {String} str
   * @param {Array<String>|String} [args]*
   * @returns {String}
   */
  fmt: function (str/*, args...*/) {
    var args, autoIndex = 0;
    args = arraySlice.call(arguments, 1);
    if (args.length === 1 && args[0] instanceof Array) {
      args = args[0];
    }
    return str.replace(/%@([0-9]+)?/g, function (all, index) {
      if (index) {
        index = parseInt(index, 10) - 1;
      }
      else {
        index = autoIndex++;
      }
      return args[index] != null ? args[index] : '';
    });
  },

  /**
   * Replace `{{name}}` parameters from the given `params` object into the given string
   *
   * @method interpolate
   * @param {String} str
   * @param {Object} [params={}]
   * @returns {String}
   */
  interpolate: function (str, params) {
    if (params == null) {
      params = {};
    }
    return str.replace(/([^\\])\{\{([^\}]+)\}\}/g, function (all, prefix, key) {
      return (prefix != null ? prefix : '') + (params[key] != null ? params[key] : '');
    });
  },

  /**
   * Removes heading and tailing spaces
   *
   * @method trim
   * @param {String} str
   * @param {String} [charsPattern='\\s']
   * @returns {String}
   */
  trim: function (str, charsPattern) {
    var re;
    if (charsPattern) {
      re = new RegExp("(^[" + charsPattern + "]+|[" + charsPattern + "]+$)", 'g');
    }
    else {
      re = /(^\s+|\s+$)/g;
    }
    return str.replace(re, '');
  },

  /**
   * Humanize a string
   *
   * @method humanize
   * @param {String} str
   * @returns {string}
   */
  humanize: function (str) {
    return self.decapitalize(self.dasherize(self.trim(str, '\\s_\\.\\-')).replace(/[^a-z0-9]+/gi, ' '));
  }

};
