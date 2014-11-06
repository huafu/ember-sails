import DS from 'ember-data';

export default DS.Model.extend({
  label: DS.attr('string'),

  accuracy: DS.attr('number', {defaultValue: 5}),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date')
});
