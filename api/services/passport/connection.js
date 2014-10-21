/**
 * Created by huafu on 10/21/14.
 */

var Promise = require('bluebird');
var model = require('../../lib/model');

var PassportConnection = function (user, provider, identifier) {
  this.passport = {
    identifier: identifier,
    provider:   provider
  };
  this.passports = [];
  this.passportRecords = [];
  this.userRecord = user || null;
  this.passportRecord = null;
  this.error = null;
  this.provider = provider;
  this.identifier = identifier;
};
(function (proto) {

  proto.start = function () {
    this.error = null;
    this.passportRecords = [];
    return this.resolve();
  };

  proto.resolve = function (something) {
    return Promise.resolve(something);
  };

  proto.checkInput = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
      // If the provider cannot be identified we cannot match it to a passport so
      // throw an error and let whoever's next in line take care of it.
      if (!self.provider) {
        reject(new Error('No authentication provider given.'));
      }
      else if (!self.identifier) {
        reject(new Error('No authentication identifier given.'));
      }
      else {
        resolve(self);
      }
    });
  };

  proto.parseProfile = function (profile) {
    // If the profile object contains a list of emails...
    if (profile.hasOwnProperty('emails') && profile.emails.length) {
      this.passports.push.apply(this.passports, _.map(profile.emails, function (email) {
        return {type: PassportType.EMAIL, identifier: email.value};
      }));
    }
    // If the profile object contains a username...
    if (profile.hasOwnProperty('username') && profile.username) {
      this.passports.push({type: PassportType.USERNAME, identifier: profile.username});
    }
    // If the profile object contains a displayName...
    if (profile.hasOwnProperty('displayName') && profile.displayName) {
      this.passport.displayName = profile.displayName;
    }

    // If we got an avatar for this provider, add it
    if (profile.hasOwnProperty('photos') && profile.photos.length) {
      this.passport.avatarUrl = profile.photos[0].value;
    }

    // If we got a profile URL for this provider, add it
    if (profile.hasOwnProperty('profileUrl') && profile.profileUrl) {
      this.passport.profileUrl = profile.profileUrl;
    }
  };

  proto.parseQuery = function (query) {
    // Get the tokens
    if (query.hasOwnProperty('tokens') && query.tokens) {
      this.passport.tokens = query.tokens;
    }

    // Get the protocol
    if (query.hasOwnProperty('protocol') && query.protocol) {
      this.passport.protocol = query.protocol;
    }
  };

  proto.lookupPassportRecord = function () {
    var self = this;
    return Passport
      .findByTypeAndIdentifier(this.provider, this.identifier)
      .populate('user')
      .then(function setPassportRecordProperty(passport) {
        self.passportRecord = passport;
      });
  };

  proto.createUserRecord = function () {
    var self = this;
    return User.create({})
      .then(function (user) {
        self.userRecord = user;
      });
  };

  proto.createAndAssociatePassport = function () {
    var self = this;
    return this.userRecord
      .associatePassportAsync(this.provider, this.identifier, this.passport)
      .then(function saveMainPassport(passport) {
        return passport.save();
      })
      .then(function setPassportRecordProperty(passport) {
        self.passportRecord = passport;
      });
  };

  proto.createAndAssociateSecondaryPassports = function () {
    var self = this;
    // here we don't care if some are failing, our main one is saved already
    return this.userRecord
      .associatePassportsAsync(this.passports, 'settle', true)
      .then(function setPassportRecordsProperty(results) {
        var passport;
        for (var i = 0; i < results.length; i++) {
          if (results[i].isRejected()) {
            console.warn('associating a passport failed silently:', results[i].reason());
          }
          else if (self.passportRecords.indexOf(passport = results[i].value()) < 0) {
            self.passportRecords.push(record);
          }
        }
      });
  };

  proto.saveUserRecord = function () {
    return this.userRecord.save();
  };

  proto.updatePassportRecord = function () {
    var excluded = [model.primaryKeyNameFor(Passport), 'type', 'identifier'];
    for (var k in this.passport) {
      if (this.passport.hasOwnProperty(k) && excluded.indexOf(k) < 0) {
        this.passportRecord[k] = this.passport[k];
      }
    }
    return this.passportRecord.save();
  };

  proto.handleError = function (error) {
    this.error = error;
    // TODO: handle each case of error to get a descriptive error
    return error;
  };

})(PassportConnection.prototype);

modules.exports = PassportConnection;