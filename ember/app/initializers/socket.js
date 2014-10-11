/* global io */

export var initialize = function (container, application) {
  var checkConnect;

  if (!io.socket.socket || !io.socket.socket.open) {
    application.deferReadiness();

    checkConnect = function () {
      if (!io.socket.socket || !io.socket.socket.open) {
        setTimeout(checkConnect, 50);
      }
      else {
        setTimeout(application.advanceReadiness.bind(application), 50);
      }
    };

    checkConnect();
  }
};

export default {
  name:   'socket',
  before: 'store',

  initialize: initialize
};
