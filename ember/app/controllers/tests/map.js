import Ember from 'ember';

export default Ember.Controller.extend({
  lat:     0,
  lng:     0,
  zoom:    5,
  type:    'road',
  markers: [
    {title: 'one', lat: 5, lng: 5},
    {title: 'two', lat: 5, lng: 0}
  ]
});
