import SailsSocketAdapter from 'ember-data-sails/adapters/sails-socket';


export default SailsSocketAdapter.extend({
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
