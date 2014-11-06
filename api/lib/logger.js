var hasProp = {}.hasOwnProperty;

var logger = {
  _debug: function () {
    if (typeof sails !== "undefined" && sails.log) {
      sails.log.verbose.apply(sails.log, arguments);
    }
    else {
      console.log.apply(console, arguments);
    }
  },
  _warn:  function () {
    if (typeof sails !== "undefined" && sails.log) {
      sails.log.warn.apply(sails.log, arguments);
    }
    else {
      console.warn.apply(console, arguments);
    }
  },

  _anonymousIndex: 0,
  guessMethodName: function (method) {
    var res;
    if (!(res = Function.prototype.toString.call(method).match(/function([^\(]*)/)[1].replace(/(^\s+|\s+)$/g, ''))) {
      res = logger.autoNamespace();
    }
    return res;
  },

  autoNamespace: function () {
    return "[anonymous#" + (++logger._anonymousIndex) + "]";
  },

  instrumentMethod: function (method, name) {
    var k, newMethod, v;
    if (name == null) {
      name = logger.guessMethodName(method);
    }
    name = name.replace(/\.prototype\./g, '#');
    logger._debug("[logger] instrumenting method " + name + "...");
    newMethod = function () {
      var arrow, err, isNew, res;
      isNew = this.constructor === newMethod;
      arrow = isNew ? '== new ==' : '== ( ) ==';
      logger._debug("[logger] =" + arrow + "> entering " + name);
      try {
        res = method.apply(this, arguments);
      }
      catch (_error) {
        err = _error;
        logger._warn("[logger] !! " + name + " threw " + err);
        if (typeof err.captureStackTrace === "function") {
          err.captureStackTrace();
        }
        throw err;
      }
      logger._debug("[logger] <" + arrow + "= exiting " + name);
      return res;
    };
    newMethod.prototype = method.prototype;
    for (k in method) {
      if (hasProp.call(method, k)) {
        v = method[k];
        newMethod[k] = v;
      }
    }
    return newMethod;
  },

  instrumentObject:  function (object, namespace) {
    var k, v;
    if (namespace == null) {
      namespace = logger.autoNamespace();
    }
    for (k in object) {
      if (hasProp.call(object, k)) {
        v = object[k];
        if (typeof v === 'function') {
          object[k] = this.instrumentMethod(v, "" + namespace + "." + k);
        }
      }
    }
    return logger;
  },

  instrumentObjects: function (set) {
    var k, o;
    for (k in set) {
      if (hasProp.call(set, k)) {
        o = set[k];
        logger.instrumentObject(o, k);
      }
    }
    return logger;
  }
};

module.exports = logger;
