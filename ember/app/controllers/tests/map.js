import Ember from 'ember';

export default Ember.Controller.extend({
  lat:     0,
  lng:     0,
  zoom:    5,
  type:    'road',
  markers: [
    Ember.Object.create({title: 'one', lat: 5, lng: 5}),
    Ember.Object.create({title: 'two', lat: 5, lng: 0})
  ]
});
