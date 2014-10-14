/* global require */

import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    var m, names = [];
    for (var name in require.entries) {
      if (!/\/tests\//.test(name) && (m = name.match(/\/models\/([^\/]+)$/))) {
        names.push(m[1].camelize());
      }
    }
    return names;
  }
});
