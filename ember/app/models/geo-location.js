import DS from 'ember-data';

export default DS.Model.extend({
  lat: DS.attr('number'),

  lng: DS.attr('number'),

  radius: DS.attr('number'),

  type: DS.belongsTo('geoLocationType'),

  source: DS.belongsTo('geoLocationSource'),

  extra: DS.attr('json'),

  createdAt: DS.attr('date'),

  updatedAt: DS.attr('date'),

  recordLabel: function () {
    return '%@,%@ (%@, source: %@)'.fmt(
      this.get('lat'), this.get('lng'), this.get('type.id'), this.get('source.id')
    );
  }.property('lat', 'lng', 'type', 'source').readOnly()
});
