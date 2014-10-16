import Ember from 'ember';

export default Ember.ObjectController.extend({
  id: Ember.computed.oneWay('model.id'),

  label: function () {
    var s;
    if ((s = this.get('model.recordLabel'))) {
      return '%@ {%@}'.fmt(s, this.get('id'));
    }
    return '{%@}'.fmt(this.get('id'));
  }.property('model.id', 'model.recordLabel').readOnly()
});
