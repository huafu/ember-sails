/* globals -PassportType */
var model = require('../lib/model');

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
  /**
   * @property FACEBOOK
   * @type String
   * @final
   */
  FACEBOOK: 'facebook',
  /**
   * @property TWITTER
   * @type String
   * @final
   */
  TWITTER:  'twitter',
  /**
   * @property GOOGLE
   * @type String
   * @final
   */
  GOOGLE:   'google',
  /**
   * @property GITHUB
   * @type String
   * @final
   */
  GITHUB:   'github',

  // config
  autoPk:   false,
  // this is small data-set more like a config and should stay in local JSON
  connection: 'configDb',

  attributes: {
    /**
     * @property id
     * @type String
     */
    id:    model.attributes.pkCode(),
    /**
     * @property label
     * @type String
     */
    label: { type: 'string', required: true }
  },

  /**
   * Creates the missing standard types
   * @returns {Promise}
   */
  createMissingStandardTypes: function () {
    return this.findOrCreateEach([model.primaryKeyNameFor(this)], [
      {id: this.EMAIL, label: 'email address'},
      {id: this.USERNAME, label: 'unique username'},
      {id: this.FACEBOOK, label: 'Facebook account'},
      {id: this.TWITTER, label: 'Twitter account'},
      {id: this.GITHUB, label: 'GitHub account'},
      {id: this.GOOGLE, label: 'Google+ account'}
    ]);
  }
};


module.exports = PassportType;
