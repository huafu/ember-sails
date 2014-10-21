export default {
  name:  'session-service',
  after: 'store-preload',

  initialize: function (container, app) {
    app.inject('route', 'session', 'service:session');
    app.inject('controller', 'session', 'service:session');
  }
};
