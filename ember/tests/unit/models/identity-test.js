import {
  moduleForModel,
  test
  } from 'ember-qunit';

moduleForModel('identity', 'Identity', {
  // Specify the other units that are required for this test.
  needs: ['model:user', 'model:identity-type']
});

test('it exists', function () {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
