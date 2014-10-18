export var initialize = function (container, application) {
  application.deferReadiness();

  application.inject('controller', 'session', 'controller:session');
  application.inject('route', 'session', 'controller:session');

  container.lookup('store:main').find('session', 'current').then(function (session) {
    container.lookup('controller:session').set('model', session);
  }).finally(function () {
    application.deferReadiness();
  });
};

export default {
  name:  'session',
  after: 'store',

  initialize: initialize
};
