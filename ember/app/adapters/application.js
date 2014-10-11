/*global io*/
import DS from 'ember-data';
import Ember from 'ember';

var RSVP = Ember.RSVP;


export default DS.RESTAdapter.extend({
  namespace: 'api/v1',
  useCSRF:   true,
  log:       true,
  debug:     true,

  CSRFToken:       '',
  listeningModels: {},

  init: function () {
    this._super();
    if (this.useCSRF) {
      io.socket.get('/csrfToken', function response(tokenObject) {
        this._debug('got new CSRF token', tokenObject);
        this.CSRFToken = tokenObject._csrf;
      }.bind(this));
    }
  },

  ajaxError: function (jqXHR) {
    var error = this._super(jqXHR);
    var data = Ember.$.parseJSON(jqXHR.responseText);

    if (data.errors) {
      this._debug('error returned from Sails', data);
      return new DS.InvalidError(this.formatError(data));
    }
    else {
      return error;
    }
  },

  formatError: function (error) {
    return Object.keys(error.invalidAttributes).reduce(function (memo, property) {
      memo[property] = error.invalidAttributes[property].map(function (err) {
        return err.message;
      });
      return memo;
    }, {});
  },

  pathForType: function (type) {
    var camelized = Ember.String.camelize(type);
    return Ember.String.singularize(camelized);
  },

  isErrorObject: function (data) {
    return !!(data.error && data.model && data.summary && data.status);
  },

  ajax: function (url, method, data) {
    return this.socket(url, method, data);
  },

  socket: function (url, method, data) {
    method = method.toLowerCase();
    var self = this, req = data;
    //self._log(method, url, data);
    if (method !== 'get') {
      this.checkCSRF(data);
    }
    return new RSVP.Promise(function (resolve, reject) {
      io.socket[method](url, data, function (data) {
        self._log(method, url, {request: req, response: data});
        if (self.isErrorObject(data)) {
          if (data.errors) {
            reject(new DS.InvalidError(self.formatError(data)));
          }
          else {
            reject(data);
          }
        }
        else {
          resolve(data);
        }
      });
    });
  },

  buildURL: function (type) {
    this._listenToSocket(type);
    return this._super.apply(this, arguments);
  },


  createRecord: function (store, type, record) {
    var data = {};
    var serializer = store.serializerFor(type.typeKey);
    serializer.serializeIntoHash(data, type, record, { includeId: true });
    return this.ajax(this.buildURL(type.typeKey, null, record), "POST", data);
  },

  checkCSRF: function (data) {
    if (!this.useCSRF) {
      return data;
    }
    this._debug('adding CSRF token');
    if (!this.CSRFToken || this.CSRFToken.length === 0) {
      throw new Error("CSRF Token not fetched yet.");
    }
    data._csrf = this.CSRFToken;
    return data;
  },


  _listenToSocket: function (model) {
    if (model in this.listeningModels) {
      return;
    }
    var store = this.container.lookup('store:main');
    var socketModel = model;

    function pushMessage(message) {
      var type = store.modelFor(socketModel);
      var serializer = store.serializerFor(type.typeKey);
      // Messages from 'created' don't seem to be wrapped correctly,
      // however messages from 'updated' are, so need to double check here.
      if (!(model in message.data)) {
        var obj = {};
        obj[model] = message.data;
        message.data = obj;
      }
      var record = serializer.extractSingle(store, type, message.data);
      // If the id is not present in the record, get it from the message
      if (!record[socketModel].id) {
        record[socketModel].id = message.id;
      }
      store.push(socketModel, record[socketModel]);
    }

    function destroy(message) {
      var type = store.modelFor(socketModel);
      var record = store.getById(type, message.id);

      if (record && typeof record.get('dirtyType') === 'undefined') {
        record.unloadRecord();
      }
    }

    var eventName = Ember.String.camelize(model).toLowerCase();
    io.socket.on(eventName, function (message) {
      this._debug('[socket][' + eventName + '] new message', message);
      if (message.verb === 'created') {
        // Run later to prevent creating duplicate records when calling store.createRecord
        Ember.run.later(null, pushMessage, message, 50);
      }
      if (message.verb === 'updated') {
        pushMessage(message);
      }
      if (message.verb === 'destroyed') {
        destroy(message);
      }
    }.bind(this));

    // We add an empty property instead of using an array
    // ao we can utilize the 'in' keyword in first test in this function.
    this.listeningModels[model] = 0;
    this._debug('[socket] listening to `' + eventName + '` for `' + model + '`');
  },

  _log: function () {
    if (this.log) {
      console.log.apply(console, arguments);
    }
  },

  _debug: function () {
    if (this.debug) {
      console.debug.apply(console, arguments);
    }
  }
});
