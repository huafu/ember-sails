var mdl = require('../lib/model');
var str = require('../lib/string');

/**
 * SocketController
 *
 * @description :: Server-side logic for managing sockets
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var SocketController = {
  subscribe: function (req, res, next) {
    var ids, data = req.allParams(), model, subscribed = {};
    for (var name in data) {
      if (name !== '_csrf' && data.hasOwnProperty(name)) {
        model = mdl.forName(name);
        subscribed[name] = !!model;
        if (model) {
          ids = data[name];
          model.subscribe(req, ids);
        }
        else {
          sails.log.warn(
            str.fmt('[socket] trying to subscribe to unknown model %@, ignoring.', name)
          );
        }
      }
    }
    res.json(subscribed);
  }
};

module.exports = SocketController;
