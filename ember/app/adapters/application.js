import SailsRESTAdapter from 'ember-data-sails/adapters/sails-rest';


export default SailsRESTAdapter.extend({
  /**
   * @inheritDoc
   */
  namespace:            'api/v1',
  /**
   * @inheritDoc
   */
  useCSRF:              true,
  /**
   * @inheritDoc
   */
  coalesceFindRequests: true
});
