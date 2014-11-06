import Ember from 'ember';
import DS from 'ember-data';

export default DS.Transform.extend({
  deserialize: function (serialized) {
    return Ember.copy(serialized, true);
  },

  serialize: function (deserialized) {
    return Ember.copy(deserialized, true);
  }
});
