import Ember from 'ember';

export var initialize = function (container/*, application*/) {
  var payload, store,
    $meta = Ember.$('meta[name="store"]');
  if ((payload = $meta.attr('content')) && (payload = JSON.parse(payload))) {
    store = container.lookup('store:main');
    store.pushPayload('user', payload, true);
  }
  $meta.remove();
};

export default {
  name:  'store-preload',
  after: 'store',

  initialize: initialize
};
