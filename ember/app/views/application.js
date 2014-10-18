import Ember from 'ember';

/**
 * @class ApplicationView
 * @constructor
 */
export default Ember.View.extend({
  classNameBindings: [
    'currentPathClassNames'
  ],
  attributeBindings: [
    'currentPath:data-current-path',
    'currentRoute:data-current-route'
  ],

  currentPath: Ember.computed.oneWay('controller.currentPath'),

  currentRoute: function () {
    return this.get('controller.currentPath').split(/\./g).slice(-2).join('.');
  }.property('controller.currentPath').readOnly(),

  currentPathClassNames: function () {
    var path = this.get('controller.currentPath');
    var resources = path.split(/\./g);
    var route = resources.pop();
    return resources.map(function (resource) {
      return 'resource-' + resource.dasherize();
    }).uniq().concat(['route-' + route.dasherize()]).join(' ');
  }.property('controller.currentPath').readOnly()
});
