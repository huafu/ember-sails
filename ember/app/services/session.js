import Ember from 'ember';

export default Ember.Object.extend({
  /**
   * @property user
   * @type User
   */
  user: null,

  init: function () {
    var userId, store,
      $meta = Ember.$('meta[name="session-user-id"]');
    this._super();
    if ((userId = $meta.attr('content')) && userId) {
      store = this.container.lookup('store:main');
      this.set('user', store.recordForId('user', userId));
    }
    else {
      this.set('user', null);
    }
    $meta.remove();
  }
});
