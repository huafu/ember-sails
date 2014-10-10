import Ember from 'ember';

export default Ember.ObjectController.extend({

  attributes: Ember.computed.oneWay('parentController.attributes'),

  fields: function () {
    var self = this;
    this._destroyFields();
    this._fields = (this.get('attributes') || []).map(function (attr) {
      return Ember.Object.create({
        owner:        self,
        name:         attr.name,
        type:         attr.type,
        valueBinding: 'owner.' + attr.name
      });
    });
    return Ember.A(this._fields);
  }.property('model', 'attributes').readOnly(),

  _destroyFields: function () {
    if (this._fields) {
      this._fields.invoke('destroy');
      this._fields = null;
    }
  }.on('destroy')
});
