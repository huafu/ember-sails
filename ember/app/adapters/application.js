/*global io*/
import DS from 'ember-data';
import Ember from 'ember';

var RSVP = Ember.RSVP;


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
    var serializer = store.serializerFor(type.typeKey);
    var data = serializer.serialize(record, { includeId: true });
    return this.ajax(this.buildURL(type.typeKey, null, record), "POST", data).then(function (payload) {
      return newPayload(store, type, payload);
    });
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
    var type = store.modelFor(model);
    var eventName = Ember.String.camelize(model).toLowerCase();

    function pushMessage(message) {
      var payload, record;
      if (message.verb === 'created') {
        record = message.data;
      }
      else {
        record = message.data[type.typeKey];
      }
      if (!record.id && message.id) {
        record.id = message.id;
      }
      payload = newPayload(store, type, record);
      store.push(model, payload);
    }

    function destroy(message) {
      var record = store.getById(type, message.id);
      if (record && typeof record.get('dirtyType') === 'undefined') {
        record.unloadRecord();
      }
    }


    io.socket.on(eventName, function (message) {
      this._debug('[socket][' + eventName + '] new message', message);

      if (message.verb === 'created') {
        // Run later to prevent creating duplicate records when calling store.createRecord
        Ember.run.next(null, pushMessage, message);
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
