import Ember from 'ember';
import ModelAttributeController from './model-attribute';

export default ModelAttributeController.extend({
  record: Ember.computed.oneWay('parentController.model'),

  isEditing: null,

  previousValue: null,

  isSaving: Ember.computed.oneWay('record.isSaving'),

  value: function (key, value/*, oldValue*/) {
    var prop = 'record.' + this.get('key'),
      val;
    if (arguments.length >= 2) {
      // set
      if (!this.get('isEditable')) {
        throw new Ember.Error('read-only attribute `%@`'.fmt(prop));
      }
      val = value;
      this._removeValueObserver();
      this.set(prop, val);
      this._addValueObserver();
    }
    else {
      val = this.get(prop);
    }
    return val;
  }.property('key'),


  _notifyValueChanged: function () {
    this.notifyPropertyChange('value');
  },

  _addValueObserver: function () {
    var record = this.get('record'),
      key = this.get('key');
    if (record && key) {
      this.addObserver('record.' + key, this, '_notifyValueChanged');
    }
  }.observes('record', 'key').on('init'),

  _removeValueObserver: function () {
    var key = this.get('key');
    if (key) {
      this.removeObserver('record.' + key, this, '_notifyValueChanged');
    }
  }.observesBefore('record', 'key').on('destroy'),


  actions: {

    toggleEditMode: function (cancel) {
      if (this.get('isEditing')) {
        if (cancel) {
          this.set('value', this.get('previousValue'));
        }
        else if (this.get('previousValue') !== this.get('value')) {
          this.get('record').save();
        }
      }
      this.set('previousValue', this.get('value'));
      this.toggleProperty('isEditing');
    },

    save: function () {
      this.get('record').save();
    },

    setAndSave: function (value) {
      this.set('value', value);
      this.send('save');
    },

    editBegin: function () {
      if (!this.get('isEditing')) {
        this.send('toggleEditMode');
      }
    },

    editSave: function () {
      if (this.get('isEditing')) {
        this.send('toggleEditMode');
      }
    },

    editCancel: function () {
      if (this.get('isEditing')) {
        this.send('toggleEditMode', true);
      }
    }

  }
});
