export var initialize = function (container, application) {
  application.inject('route', 'app', 'application:main');
  application.inject('controller', 'app', 'application:main');
};

export default {
  name: 'application',

  initialize: initialize
};
