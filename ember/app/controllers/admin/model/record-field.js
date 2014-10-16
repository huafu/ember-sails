import Ember from 'ember';
import ModelAttributeController from './model-attribute';
import BaseRecordController from './base/record';

export default ModelAttributeController.extend({
  record: Ember.computed.oneWay('parentController.model'),

  isEditing: null,

  previousValue: null,

  isSaving: Ember.computed.oneWay('record.isSaving'),

  init: function () {
    this._super.apply(this, arguments);
    this.set('isEditing', false);
  },

  selected: function (key, value) {
    var id;
    if (arguments.length >= 2) {
      this.set('value', value instanceof Ember.ObjectProxy ? value.get('content') : value);
    }
    if ((id = this.get('value.id'))) {
      return this.get('choices').findBy('id', id);
    }
    else {
      return null;
    }
  }.property('value'),

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


  dateTimeValue: function (key, value) {
    var dt;
    if (arguments.length >= 2) {
      dt = value ? moment(value) : null;
      this.set('value', dt ? dt.toDate() : null);
    }
    else {
      value = this.get('value');
      dt = value ? moment(value) : null;
    }
    return dt ? dt.format('YYYY-MM-DD HH:mm:ss') : null;
  }.property('value'),

  dateValue: function (key, value) {
    var date, time, datetime;
    if (arguments.length >= 2) {
      if (value) {
        date = moment(value, 'YYYY-MM-DD');
        if (!date.isValid()) {
          throw new TypeError('Incorrect date %@'.fmt(value));
        }
        time = moment(this.get('value'));
        datetime = moment(date.toArray().slice(0, 3).concat(time.toArray().slice(3)));
      }
      else {
        datetime = null;
      }
      this.set('value', datetime ? datetime.toDate() : null);
    }
    else {
      datetime = this.get('value');
      if (datetime) {
        datetime = moment(datetime);
      }
    }
    return datetime ? datetime.format('YYYY-MM-DD') : null;
  }.property('value'),

  timeValue: function (key, value) {
    var date, time, datetime;
    if (arguments.length >= 2) {
      if (value) {
        time = moment(value, 'HH:mm:ss');
        if (!time.isValid()) {
          throw new TypeError('Incorrect time %@'.fmt(value));
        }
        date = moment(this.get('value'));
        datetime = moment(date.toArray().slice(0, 3).concat(time.toArray().slice(3)));
      }
      else {
        datetime = null;
      }
      this.set('value', datetime ? datetime.toDate() : null);
    }
    else {
      datetime = this.get('value');
      if (datetime) {
        datetime = moment(datetime);
      }
    }
    return datetime ? datetime.format('HH:mm:ss') : null;
  }.property('value'),

  isNull: function (key, value) {
    var val;
    if (arguments.length >= 2) {
      if (value) {
        this.set('value', null);
      }
    }
    val = this.get('value');
    return val === null || val === undefined;
  }.property('value'),

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
