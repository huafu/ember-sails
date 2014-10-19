/* globals -PassportType */

/**
 * @class PassportType
 * @constructor
 */
var PassportType = {
  /**
   * @property EMAIL
   * @type String
   * @final
   */
  EMAIL:    'email',
  /**
   * @property USERNAME
   * @type String
   * @final
   */
  USERNAME: 'username',

  // config
  autoPk:   false,

  attributes: {
    /**
     * @property id
     * @type String
     */
    id:    {
      type:       'string',
      size:       32,
      required:   true,
      primaryKey: true
    },
    /**
     * @property label
     * @type String
     */
    label: { type: 'string', required: true }
  }
};


module.exports = PassportType;
