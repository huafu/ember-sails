import Ember from 'ember';

export var initialize = function (container/*, application*/) {
  var payload, store/*, typeKey*/,
    $meta = Ember.$('meta[name="store"]');
  if ((payload = $meta.attr('content')) && (payload = JSON.parse(payload))) {
    store = container.lookup('store:main');
    store.pushPayload(payload);
    /*
    for (var k in payload) {
      if (payload.hasOwnProperty(k)) {
        typeKey = k.singularize().dasherize();
        store.pushMany(typeKey, payload[k]);
      }
    }
    */
    //store.pushPayload(payload);
    //model = store.modelFor('user');
    //adapter = store.adapterFor(model);
    //store.pushPayload(model, adapter._newPayload(store, model, user));
    //this.set('user', store.recordForId('user', user.id));
  }
  $meta.remove();
};

export default {
  name:  'store-preload',
  after: 'store',

  initialize: initialize
};
