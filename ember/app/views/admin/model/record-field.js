import Ember from 'ember';

var View = Ember.View.extend({
  tagName:           'td',
  classNameBindings: ['isClickable:clickable'],
  templateName:      'admin/model/record-field',

  target: Ember.computed.oneWay('controller'),

  uniqueId: function () {
    var k = this.get('controller.key');
    if (!View.uuidSequences[k]) {
      View.uuidSequences[k] = 0;
    }
    return 'generated-id-record-field-' + k + '-' + (++View.uuidSequences[k]);
  }.property('controller.key'),

  isEditable: function () {
    return this.get('controller.isEditable') && this.get('controller.type') !== 'date';
  }.property('controller.isEditable', 'controller.type').readOnly(),

  isClickable: function () {
    return this.get('controller.type') === 'boolean' ||
      (this.get('isEditable') && !this.get('controller.isEditing'));
  }.property('isEditable', 'controller.isEditing', 'controller.type').readOnly(),

  fieldPartialName: function () {
    var suffix = this.get('controller.isRelationship') ?
      this.get('controller.relationshipKind') : this.get('controller.type');
    return 'admin/model/record-field-' + suffix.dasherize();
  }.property(
    'controller.type', 'controller.isRelationship', 'controller.relationshipKind'
  ).readOnly(),

  click: function () {
    if (!this.get('isEditable') || this.get('controller.isRelationship')) {
      return;
    }
    if (this.get('controller.type') === 'boolean') {
      this.toggleProperty('controller.value');
      this.send('save');
    }
    else {
      this.send('editBegin');
      Ember.run.schedule('afterRender', this, function () {
        this.$('input').focus();
      });
    }
  }
});

View.reopenClass({
  uuidSequences: {}
});

export default View;
