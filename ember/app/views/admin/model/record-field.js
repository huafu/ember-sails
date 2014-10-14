import Ember from 'ember';

var View = Ember.View.extend({
  tagName:           'td',
  classNameBindings: ['isClickable:clickable'],
  templateName:      'admin/model/record-field',

  target: Ember.computed.oneWay('controller'),

  isClickable: function () {
    return this.get('controller.type') === 'boolean' ||
      (this.get('controller.isEditable') && !this.get('controller.isEditing'));
  }.property('controller.isEditable', 'controller.isEditing', 'controller.type').readOnly(),

  fieldPartialName: function () {
    return 'admin/model/record-field-' + this.get('controller.type');
  }.property('controller.type').readOnly(),

  eventManager: {
    click: function (event, view) {
      if (view instanceof View) {
        if (view.get('controller.type') === 'boolean') {
          view.toggleProperty('controller.value');
          view.send('save');
        }
        else {
          view.send('editBegin');
        }
      }
    }
  }
});

export default View;
