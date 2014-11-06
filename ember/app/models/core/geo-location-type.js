import DS from 'ember-data';

export default DS.Model.extend({
  label: DS.attr('string'),

  level: DS.attr('number', {defaultValue: 0}),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date')
});
