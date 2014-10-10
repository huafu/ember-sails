import DS from 'ember-data';

export default DS.SailsSocketAdapter.extend({
  namespace: 'api/v1',
  log:       true,
  useCSRF:   true
});
