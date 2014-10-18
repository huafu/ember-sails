import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  code: DS.attr('string'),

  label: DS.attr('string'),

  template: DS.attr('string'),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date'),

  recordLabel: Ember.computed.alias('label')
});
