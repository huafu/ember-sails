import Ember from 'ember';

// TODO: move this in some config
var ENABLED_PROVIDERS = ['facebook', 'google', 'twitter', 'github'];

export default Ember.Controller.extend({

  passportTypes: function () {
    return this.store.filter('passport-type', function (record) {
      return ENABLED_PROVIDERS.contains(record.get('code'));
    });
  }.property().readOnly(),

  sessionUserPassports: function () {
    return this.get('session.user.passports').filter(function (record) {
      return ENABLED_PROVIDERS.contains(record.get('type.code'));
    });
  }.property('session.user.passports.@each.type').readOnly()

});
