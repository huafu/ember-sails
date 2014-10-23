import Ember from 'ember';


export default Ember.View.extend({
  tagName:           'nav',
  classNames:        ['top-bar'],
  attributeBindings: ['1:data-topbar'],
  // so that we can have attributes present even if they should not have values
  '1':               '1'
});
