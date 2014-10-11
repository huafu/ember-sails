/*global io*/
import DS from 'ember-data';
import Ember from 'ember';


function newPayload(store, type, record) {
  var res = {}, extracted;
  if (arguments.length > 0) {
    extracted = [];
    payloadInject(store, res, type, record, extracted);
  }
  return res;
}

function payloadInject(store, payload, type, record, _extracted) {
  var index, records, toExtract,
    typeKey = (type.typeKey ? type.typeKey : type).pluralize();
  if (!payload[typeKey]) {
    payload[typeKey] = [];
  }
  if (record) {
    records = Ember.typeOf(record) === 'array' ? record : [record];
    index = {};
    toExtract = [];
    payload[typeKey].forEach(function (record) {
      index['' + record.id] = 0;
    });
    records.forEach(function (record) {
      var id = '' + record.id;
      if (!record.id) {
        throw new ReferenceError('Got a record without id for ' + typeKey);
      }
      if (!(id in index)) {
        index[id] = 0;
        payload[typeKey].push(record);
        toExtract.push(record);
      }
    });
    toExtract.forEach(function (record) {
      payloadExtractEmbedded(store, payload, type, record, _extracted);
    });
  }
  return payload;
}

function payloadExtractEmbedded(store, payload, type, record, _extracted) {
  var extracted = _extracted ? _extracted : [];
  if (extracted.indexOf(record) < 0) {
    extracted.push(record);
    type.eachRelationship(function (key, rel) {
      var data;
      if ((data = record[key])) {
        if (rel.kind === 'belongsTo') {
          if (Ember.typeOf(record[key]) === 'object') {
            delete record[key];
            payloadInject(store, payload, rel.type, data, extracted);
            record[key] = data.id;
          }
        }
        else if (rel.kind === 'hasMany') {
          record[key] = data.map(function (item) {
            if (Ember.typeOf(item) === 'object') {
              payloadInject(store, payload, rel.type, item, extracted);
              return item.id;
            }
            return item;
          });
        }
        else {
          throw new ReferenceError('Unknown relationship kind ' + rel.kind);
        }
      }
    });
  }
  return payload;
}

export default DS.RESTAdapter.extend({
  namespace:            'api/v1',
  useCSRF:              true,
  log:                  true,
  debug:                true,
  coalesceFindRequests: true,

  CSRFToken:       null,
  socketListeners: null,

  init: function () {
    var self = this;
    this._super();
    this.socketListeners = {};
    ['connect', 'disconnect', 'reconnect'].forEach(function (event) {
      this.socketAddListener(event, this._debug);
    }, this);
    if (this.useCSRF) {
      io.socket.get('/csrfToken', function (tokenObject) {
        self._debug('got new CSRF token', tokenObject);
        self.CSRFToken = tokenObject._csrf;
      });
    }
  },


  destroy: function () {
    //Ember.keys(this.socketListeners).map(this.socketRemoveListener, this);
    this._super();
  },

  socketAddListener: function (event, callback, metadata) {
    var def = this.socketListeners[event];
    if (def) {
      this._log('[socket]', 'already listening for ' + event, def);
      return;
    }
    def = this.socketListeners[event] = {data: metadata, event: event};
    def.callback = callback.bind(this, def);
    io.socket.addListener(event, def.callback);
    this._debug('[socket]', 'listening for ' + event, def);
  },

  socketRemoveListener: function (event) {
    var def = this.socketListeners[event];
    if (!def) {
      this._log('[socket]', 'not listening for ' + event + ' yet');
      return;
    }
    delete this.socketListeners[event];
    io.socket.removeListener(event, def.callback);
    this._debug('[socket]', 'stop listening for ' + event, def);
  },

  socketIsListening: function (event) {
    return !!this.socketListeners[event];
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
    return Ember.String.camelize(type).pluralize();
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
    return new Ember.RSVP.Promise(function (resolve, reject) {
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
    var serializer = store.serializerFor(type.typeKey);
    var data = serializer.serialize(record, { includeId: true });
    return this.ajax(this.buildURL(type.typeKey, null, record), "POST", data).then(function (payload) {
      return newPayload(store, type, payload);
    });
  },

  updateRecord: function (store, type, record) {
    var serializer = store.serializerFor(type.typeKey);
    var data = serializer.serialize(record, { includeId: true });
    return this.ajax(
      this.buildURL(type.typeKey, data.id, record), "PUT", data
    ).then(
      function (payload) {
        return newPayload(store, type, payload);
      }
    );
  },

  find: function (store, type/*, id, record*/) {
    return this._super.apply(arguments).then(function (payload) {
      return newPayload(store, type, payload);
    });
  },


  findAll: function (store, type/*, sinceToken*/) {
    return this._super.apply(this, arguments).then(function (payload) {
      return newPayload(store, type, payload);
    });
  },

  findBelongsTo: function (/*store, record, url*/) {
    // TODO: check what is returning Sails in that case
    return this._super.apply(this, arguments);
  },

  findHasMany: function (/*store, record, url*/) {
    // TODO: check what is returning Sails in that case
    return this._super.apply(this, arguments);
  },

  findMany: function (store, type, ids/*, records*/) {
    return this.findQuery(store, type, {where: {id: ids}});
  },

  findQuery: function (store, type, query) {
    return this.ajax(this.buildURL(type.typeKey), 'GET', query).then(function (payload) {
      return newPayload(store, type, payload);
    });
  },

  deleteRecord: function (store, type, record) {
    return this.ajax(
      this.buildURL(type.typeKey, record.get('id'), record),
      'DELETE',
      {}
    ).then(function (payload) {
        return newPayload(store, type, payload);
      }
    );
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


  handleSocketMessage: function (meta, message) {
    var method = 'handleSocketRecord' + message.verb.capitalize();
    this._debug('[socket][' + meta.event + ':' + message.verb + '] new message', message);
    if (this[method]) {
      Ember.run.next(this, method, meta, message);
    }
    else {
      this._debug('[socket]', 'nothing to handle message with verb ' + message.verb);
    }
  },

  handleSocketRecordCreated: function (meta, message) {
    var type = meta.data.type,
      store = meta.data.store,
      record = message.data;
    if (!record.id && message.id) {
      record.id = message.id;
    }
    store.pushPayload(store, newPayload(store, type, record));
  },

  handleSocketRecordUpdated: Ember.aliasMethod('handleSocketRecordCreated'),

  handleSocketRecordDestroyed: function (meta, message) {
    var type = meta.data.type,
      store = meta.data.store,
      record = store.getById(type.typeKey, message.id);
    if (record && typeof record.get('dirtyType') === 'undefined') {
      record.unloadRecord();
    }
  },


  _listenToSocket: function (model) {
    var eventName = Ember.String.camelize(model).toLowerCase();
    if (this.socketIsListening(eventName)) {
      return;
    }
    var store = this.container.lookup('store:main');
    var type = store.modelFor(model);
    this.socketAddListener(eventName, this.handleSocketMessage, {store: store, type: type});
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
