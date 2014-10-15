import Ember from 'ember';

Ember.View.reopen({
  setupFoundation: function () {
    Ember.run.schedule('afterRender', this, function(){
      this.$().foundation();
    });
  }.on('didInsertElement')
});
