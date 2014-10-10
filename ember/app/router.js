import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function () {
  this.resource('admin/models', function () {
    this.route('index', {path: '/'});
    this.resource('admin/model', {path: ':name'}, function () {
      this.route('index', {path: '/'});
      this.resource('admin/model/records', {path: 'records'}, function () {
        this.route('index', {path: '/'});
      });
    });
  });
});

export default Router;
