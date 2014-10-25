/* globals -User */
var model = require('../lib/model'),
  record = require('../lib/record'),
  Promise = require('bluebird'),
  str = require('../lib/string');

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
     * @returns {String}
     */
    getSlugId: function () {
      return record.identify(this);
    },


    /**
     * Inject in given payload out data flattened
     *
     * @param {Object} payload
     */
    flatInjectInPayload: function (payload) {
      var user = this.toJSON();

      function inject(key, record) {
        if (!payload[key]) {
          payload[key] = [];
        }
        if (_.isArray(record)) {
          _.each(record, function (r) {
            payload[key].push(r);
          });
        }
        else if (record && _.isObject(record)) {
          payload[key].push(record);
        }
      }

      if (_.isObject(user.email)) {
        user.email = user.email.id;
      }
      if (_.isObject(user.username)) {
        user.username = user.username.id;
      }
      if (_.isObject(user.avatar)) {
        user.avatar = user.avatar.id;
      }
      inject('passports', user.passports);
      user.passports = _.map(user.passports, 'id');
      inject('users', user);
    },


    /**
     * Associate a given passport to this user
     * __WARNING__: this does NOT save the association, you MUST save the user after
     *
     * @method associatePassport
     * @param {Passport} passport
     * @chainable
     */
    associatePassport: function (passport) {
      var associated;
      if (passport.user && !(associated = record.isSamePrimaryKey(this, passport.user))) {
        throw new ReferenceError('Passport.AlreadyAssociatedWithDifferentUser');
      }
      if (!associated) {
        sails.log.verbose(
          str.fmt('associating passport %@ with user %@', passport.getSlugId(), this.getSlugId())
        );
        passport.user = record.identify(this);
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
      var samePk = record.isSamePrimaryKey;
      if (samePk(this, passport.user)) {
        if (samePk(this.email, passport)) {
          throw new Error('Passport.CantDissociatePrimaryEmailPassport');
        }
        if (samePk(this.username, passport)) {
          sails.log.verbose(
            str.fmt('un-registering passport %@ as username for user %@', passport.getSlugId(), this.getSlugId())
          );
          this.username = null;
        }
        if (samePk(this.avatar, passport)) {
          sails.log.verbose(
            str.fmt('un-registering passport %@ as avatar for user %@', passport.getSlugId(), this.getSlugId())
          );
          this.avatar = null;
        }
        sails.log.verbose(
          str.fmt('dissociating passport %@ from user %@', passport.getSlugId(), this.getSlugId())
        );
        passport.clearAuthFields();
        passport.user = null;
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
     * @param {Object} [extra]
     * @returns {Promise}
     */
    associatePassportAsync: function (type, identifier, extra) {
      var self = this,
        excluded = ['identifier', 'type', model.primaryKeyNameFor(Passport)],
        values = _.merge({}, extra || {}, {user: record.identify(this)});
      sails.log.verbose(
        str.fmt(
          'trying to associate passport %@ with user %@',
          Passport.computeSlugId(type, identifier), this.getSlugId()
        )
      );
      return Passport.findOrCreateByTypeAndIdentifier(type, identifier, values)
        .then(function updatePassportProperties(passport) {
          for (var k in values) {
            if (k !== 'user' && excluded.indexOf(k) < 0 && values.hasOwnProperty(k)) {
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
     * @returns {Promise}
     */
    dissociatePassportAsync: function (type, identifier) {
      var self = this;
      sails.log.verbose(
        str.fmt(
          'trying to dissociate passport %@ with user %@',
          Passport.computeSlugId(type, identifier), this.getSlugId()
        )
      );
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
     * @returns {Promise}
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
    },

    /**
     * Complete our user using the given passport if there are any missing information
     * @param {Passport} passport
     * @chainable
     */
    completeFromPassport: function (passport) {
      var typeCode = passport.getTypeCode(),
        passportId = record.identify(passport);
      if (!record.isSamePrimaryKey(passport.user, this)) {
        throw new Error('Passport.UserDoNotOwnPassport');
      }
      if (!this.username && typeCode === PassportType.USERNAME) {
        sails.log.verbose(
          str.fmt('registering passport %@ as username for user %@', passport.getSlugId(), this.getSlugId())
        );
        this.username = passportId;
      }
      else if (!this.email && typeCode === PassportType.EMAIL) {
        sails.log.verbose(
          str.fmt('registering passport %@ as email for user %@', passport.getSlugId(), this.getSlugId())
        );
        this.email = passportId;
      }
      if (!this.avatar && passport.avatarUrl) {
        sails.log.verbose(
          str.fmt('registering passport %@ as avatar for user %@', passport.getSlugId(), this.getSlugId())
        );
        this.avatar = passportId;
      }
      if (!this.displayName && passport.displayName) {
        sails.log.verbose(
          str.fmt('using display name from passport %@ for user %@', passport.getSlugId(), this.getSlugId())
        );
        this.displayName = passport.displayName;
      }
      return this;
    }
  },

  /**
   * Finds a user associated to a given passport type and identifier
   *
   * @method findByPassport
   * @static
   * @param {PassportType|String} type
   * @param {String} identifier
   * @returns {Promise}
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
