import DS from 'ember-data';
import PassportCore from './core/passport';

export default PassportCore.extend({
  password:      DS.attr('string'),

  // TODO: send this from the backend without storing it in the DB
  disconnectUrl: function () {
    return '/auth/' + this.get('type.code') + '/disconnect/' + encodeURIComponent(this.get('identifier'));
  }.property('type.code', 'identifier').readOnly(),

  recordLabel: function () {
    return '%@#%@'.fmt(this.get('type.id'), this.get('identifier'));
  }.property('type.id', 'identifier').readOnly()
});
