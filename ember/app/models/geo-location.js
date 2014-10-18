import DS from 'ember-data';

export default DS.Model.extend({
  lat: DS.attr('number'),

  lng: DS.attr('number'),

  radius: DS.attr('number'),

  type: DS.belongsTo('geoLocationType'),

  source: DS.belongsTo('geoLocationSource'),

  data: DS.attr('json'),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date')
});
