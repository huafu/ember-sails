import Ember from 'ember';

export default Ember.Object.extend({
  /**
   * @property user
   * @type User
   */
  user: null,

  init: function () {
    var user, adapter, store, model,
      $meta = Ember.$('meta[name="session-user"]');
    this._super();
    if ((user = $meta.attr('content')) && (user = JSON.parse(user)) && user.id) {
      store = this.container.lookup('store:main');
      model = store.modelFor('user');
      adapter = store.adapterFor(model);
      store.pushPayload(model, adapter._newPayload(store, model, user));
      this.set('user', store.recordForId('user', user.id));
    }
    else {
      this.set('user', null);
    }
    $meta.remove();
  }
});
