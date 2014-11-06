/* globals -Passport */

var bcrypt = require('bcryptjs');
var model = require('../lib/model');
var record = require('../lib/record');
var str = require('../lib/string');
var Promise = require('bluebird');

/**
 * Hash a passport password.
 *
 * @private
 * @param {Passport} passport
 * @param {Function} next
 */
function hashPassword(passport, next) {
  if (passport.password) {
    bcrypt.hash(passport.password, 10, function (err, hash) {
      passport.password = hash;
      next(err, passport);
    });
  }
  else {
    next(null, passport);
  }
}
var _knownTypes = {};
function grabPassportType(type) {
  var id = record.identify(type);
  if (!id) {
    return Promise.reject(new Error('passport type not specified'));
  }
  else if (!_knownTypes[id]) {
    return PassportType.findOne(id)
      .then(function registerPassportType(passportType) {
        if (!passportType) {
          return Promise.reject(new ReferenceError(str.fmt('unknown passport type `%@`', id)));
        }
        _knownTypes[id] = passportType;
        return passportType;
      });
  }
  else {
    return Promise.resolve(_knownTypes[id]);
  }
}

/**
 * Passport Model
 *
 * The Passport model handles associating authenticators with users. An authen-
 * ticator can be either local (password) or third-party (provider). A single
 * user can have multiple passports, allowing them to connect and use several
 * third-party strategies in optional conjunction with a password.
 *
 * Since an application will only need to authenticate a user once per session,
 * it makes sense to encapsulate the data specific to the authentication process
 * in a model of its own. This allows us to keep the session itself as light-
 * weight as possible as the application only needs to serialize and deserialize
 * the user, but not the authentication data, to and from the session.
 *
 * @class Passport
 * @constructor
 */
var Passport = {
  attributes: {
    // Required field: Protocol
    //
    // Defines the protocol to use for the passport. When employing the local
    // strategy, the protocol will be set to 'local'. When using a third-party
    // strategy, the protocol will be set to the standard used by the third-
    // party service (e.g. 'oauth', 'oauth2', 'openid').
    /**
     * @property protocol
     * @type String
     */
    protocol:   { type: 'alphanumeric' },

    // Local field: Password
    //
    // When the local strategy is employed, a password will be used as the
    // means of authentication along with either a username or an email.
    /**
     * @property password
     * @type String
     */
    password:   { type: 'string', minLength: 8, 'protected': true },

    // Provider fields: Provider, identifier and tokens
    //
    // "provider" is the name of the third-party auth service in all lowercase
    // (e.g. 'github', 'facebook') whereas "identifier" is a provider-specific
    // key, typically an ID. These two fields are used as the main means of
    // identifying a passport and tying it to a local user.
    //
    // The "tokens" field is a JSON object used in the case of the OAuth stan-
    // dards. When using OAuth 1.0, a `token` as well as a `tokenSecret` will
    // be issued by the provider. In the case of OAuth 2.0, an `accessToken`
    // and a `refreshToken` will be issued.

    // we'll get the provider through type.id
    //provider:   { type: 'alphanumericdashed' },
    /**
     * @property identifier
     * @type String
     */
    identifier: { type: 'string', required: true },
    /**
     * @property tokens
     * @type Object
     */
    tokens:     { type: 'json' },

    /**
     * @property lastLoginAt
     * @type Date
     */
    lastLoginAt:    { type: 'datetime' },
    /**
     * @property lastLocation
     * @type GeoLocation
     */
    lastLocation: { model: 'GeoLocation' },

    /**
     * @property user
     * @type User
     */
    user: { model: 'User', via: 'passports' },
    /**
     * @property type
     * @type PassportType
     */
    type: { model: 'PassportType', required: true },

    /**
     * @property displayName
     * @type String
     */
    displayName: { type: 'string' },

    /**
     * @property gender
     * @type String
     */
    gender: model.attributes.gender(),
    /**
     * @property avatarUrl
     * @type String
     */
    avatarUrl:   { type: 'url' },
    /**
     * @property profileUrl
     * @type String
     */
    profileUrl:  { type: 'url' },
    /**
     * @property raw
     * @type Object
     */
    raw:     { type: 'json' },

    /**
     * Validate password used by the local strategy.
     *
     * @method validatePassword
     * @param {string}   password The password to validate
     * @return {Promise}
     */
    validatePassword: function (password) {
      return new Promise(function validatePassword(resolve, reject) {
        bcrypt.compare(password, this.password, function (err, result) {
          if (err) {
            reject(err);
          }
          else {
            resolve(result);
          }
        });
      });
    },


    /**
     * Clear all authentication related fields
     *
     * @method clearAuthFields
     * @chainable
     */
    clearAuthFields: function () {
      _.map(['protocol', 'password', 'tokens'], function (key) {
        this[key] = null;
      }, this);
      return this;
    },

    /**
     * Get the display name of this passport (label)
     *
     * @method getDisplayName
     * @returns {String} The displayName of the passport
     */
    getDisplayName: function () {
      return '' + (this.displayName || this.identifier || this.id);
    },

    /**
     * Get the code of the passport type
     *
     * @method getTypeCode
     * @returns {String}
     */
    getTypeCode: function () {
      return record.identify(this.type);
    },

    /**
     * Get an ID that can be used in an URL to uniquely identify this record
     * @returns {string}
     */
    getSlugId: function () {
      return Passport.computeSlugId(this.getTypeCode(), this.identifier);
    }

  },

  /**
   * Callback to be run before creating a Passport.
   *
   * @method beforeCreate
   * @static
   * @param {Object}   passport The soon-to-be-created Passport
   * @param {Function} next
   */
  beforeCreate: function (passport, next) {
    hashPassword(passport, next);
  },

  /**
   * Callback to be run before updating a Passport.
   *
   * @method beforeUpdate
   * @static
   * @param {Object}   passport Values to be updated
   * @param {Function} next
   */
  beforeUpdate: function (passport, next) {
    hashPassword(passport, next);
  },

//  beforeValidate: function (passport, next) {
//    console.log('before validate', passport);
//    next(null, passport);
//  },
//  afterValidate:  function (passport, next) {
//    console.log('after validate', passport);
//    next(null, passport);
//  },

  /**
   * Finds a passport by type and identifier
   *
   * @method findByTypeAndIdentifier
   * @static
   * @param {String|PassportType} type
   * @param {String} identifier
   * @param {Object} [where]
   * @returns {Promise}
   */
  findByTypeAndIdentifier: function (type, identifier, where) {
    var criteria = _.merge({}, where || {}, {
      type:       record.identify(type, PassportType),
      identifier: identifier
    });
    console.assert(identifier, 'passport identifier required');
    console.assert(type, 'passport type required');
    return this.findOne(criteria);
  },

  /**
   * Find or create a passport by type and identifier
   *
   * @method findOrCreateByTypeAndIdentifier
   * @static
   * @param {String|PassportType} type
   * @param {String} identifier
   * @param {Object} [createValues]
   * @returns {Promise}
   */
  findOrCreateByTypeAndIdentifier: function (type, identifier, createValues) {
    var where = {
        type:       record.identify(type, PassportType),
        identifier: identifier
      },
      values = _.merge({}, createValues || {}, where);
    if (values.user) {
      values.user = record.identify(values.user);
    }
    console.assert(identifier, 'passport identifier required');
    console.assert(type, 'passport type required');
    return this.findOrCreate(where, values);
  },

  /**
   * Compute a slug ID from a passport type and identifier
   * @param {String} type
   * @param {String} identifier
   * @returns {string}
   */
  computeSlugId: function (type, identifier) {
    return type + '-' + identifier;
  }
};

module.exports = Passport;
