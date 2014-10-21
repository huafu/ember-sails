import Ember from 'ember';

/* Modernizr is doing this
 if (!Function.prototype.bind) {
 Function.prototype.bind = function (context) {
 if (typeof this !== "function") {
 // closest thing possible to the ECMAScript 5
 // internal IsCallable function
 throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
 }
 var args = Array.prototype.slice.call(arguments, 1),
 method = this,
 Noop = function () {
 },
 res = function () {
 return method.apply(
 this instanceof Noop && context ? this : context,
 args.concat(Array.prototype.slice.call(arguments))
 );
 };
 Noop.prototype = this.prototype;
 res.prototype = new Noop();
 return res;
 };
 }
 */

Ember.runInDebug(function overrideLiveReload() {
  if (window.LiveReload) {
    Ember.debug('[live-reload] overriding live-reload delay...');
    window.LiveReload.reloader.reloadPage = (function (reloadPage) {
      return function () {
        setTimeout(reloadPage.bind(this), 1000);
      };
    })(window.LiveReload.reloader.reloadPage);
  }
});

Ember.View.reopen({
  setupFoundation: function () {
    Ember.run.schedule('afterRender', this, function () {
      this.$().foundation();
    });
  }.on('didInsertElement')
});
