/* globals -User */
var model = require('../lib/model'),
  record = require('../lib/record'),
  Promise = require('bluebird');

/**
 * @class User
 * @constructor
 */
var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    /**
     * @property username
     * @type Passport
     */
    username:  { model: 'Passport' },
    /**
     * @property email
     * @type Passport
     */
    email:     { model: 'Passport' },
    /**
     * @property avatar
     * @type Passport
     */
    avatar:    { model: 'Passport' },
    /**
     * @property passports
     * @type Array<Passport>
     */
    passports: { collection: 'Passport', via: 'user' },

    /**
     * @property displayName
     * @type String
     */
    displayName: { type: 'string', required: true },
    /**
     * @property isClaimed
     * @type Boolean
     */
    isClaimed:   { type: 'boolean', defaultsTo: true },

    /**
     * Associate a given passport to this user
     * __WARNING__: this does NOT save the association, you MUST save the user after
     *
     * @method associatePassport
     * @param {Passport} passport
     * @chainable
     */
    associatePassport: function (passport) {
      var associated, typeCode;
      if (passport.user && !(associated = record.isSamePrimaryKey(this, passport.user))) {
        throw new ReferenceError('Passport.AlreadyAssociatedWithDifferentUser');
      }
      if (!associated) {
        this.passports.add(passport);
      }
      typeCode = passport.getTypeCode();
      if (!this.username && typeCode === PassportType.USERNAME) {
        this.username = passport;
      }
      else if (!this.email && typeCode === PassportType.EMAIL) {
        this.email = passport;
      }
      if (!this.avatar && passport.avatarUrl) {
        this.avatar = passport;
      }
      if (!this.displayName && passport.displayName) {
        this.displayName = passport.displayName;
      }
      return this;
    },

    /**
     * Dissociate a given passport to this user
     * __WARNING__: this does NOT save the dissociation, you MUST save the user after
     *
     * @method dissociatePassport
     * @param {Passport} passport
     * @chainable
     */
    dissociatePassport: function (passport) {
      var typeCode, samePk = record.isSamePrimaryKey;
      if (samePk(this, passport.user)) {
        if (samePk(this.email, passport)) {
          throw new Error('Passport.CantDissociatePrimaryEmailPassport');
        }
        if (samePk(this.username, passport)) {
          this.username = null;
        }
        if (samePk(this.avatar, passport)) {
          this.avatar = null;
        }
        passport.clearAuthFields();
        this.passports.remove(passport);
      }
      return this;
    },

    /**
     * Associate a passport given by type and identifier, creating the passport if necessary
     * __WARNING__: this does NOT save the association, you MUST save the user after
     *
     * @method associatePassportAsync
     * @param {String|PassportType} type
     * @param {String} identifier
     * @param {Object} [values]
     * @returns {Deferred}
     */
    associatePassportAsync: function (type, identifier, values) {
      var self = this,
        excluded = ['identifier', 'type', model.primaryKeyNameFor(Passport)];
      return Passport.findOrCreateByTypeAndIdentifier(type, identifier, values)
        .populateAll()
        .then(function updatePassportProperties(passport) {
          for (var k in values) {
            if (excluded.indexOf(k) < 0 && values.hasOwnProperty(k)) {
              passport[k] = values[k];
            }
          }
          return passport;
        })
        .then(function associatePassport(passport) {
          self.associatePassport(passport);
          return passport;
        });
    },

    /**
     * Dissociate a passport given by type and identifier if it exists
     * __WARNING__: this does NOT save the dissociation, you MUST save the user after
     *
     * @method dissociatePassportAsync
     * @param {String|PassportType} type
     * @param {String} identifier
     * @returns {Deferred}
     */
    dissociatePassportAsync: function (type, identifier) {
      var self = this;
      return Passport.findByTypeAndIdentifier(type, identifier, {user: record.identify(this)})
        .then(function dissociatePassport(passport) {
          if (passport) {
            self.dissociatePassport(passport);
          }
          return passport;
        });
    },


    /**
     * Create/update passports and associate them with the current user
     * __WARNING__: this does NOT save the associations, you MUST save the user after
     *
     * @method associatePassportsAsync
     * @param {Array<Object>} passports
     * @param {String} [promiseMethod='all']
     * @param {Boolean} [save]
     * @returns {Deferred}
     */
    associatePassportsAsync: function (passports, promiseMethod, save) {
      var identifier, type, values, one,
        promises = [];

      function savePassport(passport) {
        if (save) {
          return passport.save();
        }
        return passport;
      }

      // build parameters for each passport and get the promise
      for (var i = 0; i < passports.length; i++) {
        one = passports[i];
        identifier = one.identifier;
        type = one.type;
        values = _.merge({}, one);
        delete values.identifier;
        delete values.type;
        promises.push(
          this
            .associatePassportAsync(type, identifier, values)
            .then(savePassport)
            .done()
        );
      }
      return Promise[promiseMethod || 'all'](promises);
    },

    /**
     * Finds a passport in the populated passports
     *
     * @method populatedPassport
     * @param {String|PassportType} type
     * @param {String} identifier
     * @return {Passport}
     */
    populatedPassport: function (type, identifier) {
      console.assert(identifier, 'passport identifier required');
      console.assert(type, 'passport type required');
      return _.find(this.passports, {type: record.identify(type, PassportType), identifier: identifier});
    },

    /**
     * Finds all passports in the populated passports for the given type (provider)
     *
     * @method populatedPassports
     * @param {String|PassportType} type
     * @return {Array<Passport>}
     */
    populatedPassports: function (type) {
      console.assert(type, 'passport type required');
      return _.filter(this.passports, {type: record.identify(type, PassportType)});
    }
  },

  /**
   * Finds a user associated to a given passport type and identifier
   *
   * @method findByPassport
   * @static
   * @param {PassportType|String} type
   * @param {String} identifier
   * @returns {Deferred}
   */
  findByPassport: function (type, identifier) {
    var self = this;
    return Passport
      .findByTypeAndIdentifier(type, identifier, {user: {not: null}})
      .then(function grabAssociatedUser(passport) {
        return self.findOne(record.identify(passport.user));
      });
  }
};

module.exports = User;
