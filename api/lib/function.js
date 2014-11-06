var self,
  arraySlice = [].slice,
  hasProp = {}.hasOwnProperty;

self = module.exports = {
  extendClass: function (parent, child) {
    for (var key in parent) {
      if (hasProp.call(parent, key)) {
        child[key] = parent[key];
      }
    }
    function Constructor() {
      this.constructor = child;
    }

    Constructor.prototype = parent.prototype;
    child.prototype = new Constructor();
    child.__super__ = parent.prototype;
    return child;
  },

  wrap: function (method/*, args...*/, wrapper) {
    var args = arraySlice.call(arguments, 1);
    wrapper = args.pop();
    return function () {
      return wrapper.call.apply(wrapper, [this, method].concat(arraySlice.call(args), [arguments]));
    };
  },

  wrapConstructor: function (Class/*, args...*/, wrapper) {
    var __dynamic__, args = arraySlice.call(arguments, 1);
    wrapper = args.pop();
    return __dynamic__ = (function (SuperClass) {
      self.extend(SuperClass, __dynamic__);
      /* jshint -W004 */
      function __dynamic__() {
        wrapper.call.apply(wrapper, [this, __dynamic__.__super__.constructor].concat(arraySlice.call(args), [arguments]));
      }

      return __dynamic__;
    })(Class);
  }
};
