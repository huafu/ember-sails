import Ember from 'ember';

export default Ember.Object.extend({
  /**
   * @property user
   * @type User
   */
  user: null,

  init: function () {
    var user, adapter, store, model;
    this._super();
    if ((user = Ember.$('meta[name="session-user"]').attr('content')) && (user = JSON.parse(user)) && user.id) {
      store = this.container.lookup('store:main');
      model = this.container.lookup('model:user');
      adapter = store.adapterFor(model);
      store.pushPayload(model, adapter._newPayload(store, model, user));
      this.set('user', store.recordForId('user', user.id));
    }
    else {
      this.set('user', null);
    }
  }
});
