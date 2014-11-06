/**
 * Created by huafu on 10/21/14.
 */

var Promise = require('bluebird');
var model = require('../../lib/model');
var record = require('../../lib/record');
var validator = require('validator');

var PassportConnection = function (user, provider, identifier) {
  this.userRecord = user || null;
  this.type = provider;
  this.identifier = identifier;
  this.passport = null;
  this.passports = null;
  this.passportRecords = null;
  this.passportRecord = null;
  this.error = null;
};
(function (proto) {

  proto.start = function () {
    this.error = null;
    this.passportRecords = [];
    this.passportRecord = null;
    this.passports = [];
    this.passport = {
      identifier: this.identifier,
      type:       this.type
    };
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
      if (!self.type) {
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
    // If we have raw data, save it as well
    if (profile._json) {
      this.passport.raw = _.cloneDeep(profile._json);
    }
    // If the profile object contains a list of emails...
    if (profile.hasOwnProperty('emails') && profile.emails.length) {
      for (var i = 0; i < profile.emails.length; i++) {
        if (validator.isEmail(profile.emails[i].value)) {
          this.passports.push({
            type:       PassportType.EMAIL,
            identifier: profile.emails[i].value
          });
        }
      }
    }
    // parse the gender
    // TODO: check for several people (group)
    if (profile.hasOwnProperty('gender') && profile.gender) {
      this.passport.gender = profile.gender;
    }
    else if (profile._json && profile._json.gender) {
      this.passport.gender = profile._json.gender;
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
    else if (profile._json && profile._json.avatar_url) {
      // github
      this.passport.avatarUrl = profile._json.avatar_url;
    }
    else if (profile._json && profile._json.picture) {
      // google+
      this.passport.avatarUrl = profile._json.picture;
    }
    else {
      // try to handle known URL from providers
      if (this.type === PassportType.FACEBOOK) {
        this.passport.avatarUrl = 'https://graph.facebook.com/' + this.identifier + '/picture?type=normal';
      }
    }

    // If we got a profile URL for this provider, add it
    if (profile.hasOwnProperty('profileUrl') && profile.profileUrl) {
      this.passport.profileUrl = profile.profileUrl;
    }
    else if (profile._json && profile._json.link) {
      // google+
      this.passport.profileUrl = profile._json.link;
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
      .findByTypeAndIdentifier(this.type, this.identifier)
      .then(function setPassportRecordProperty(passport) {
        self.passportRecord = passport;
      });
  };

  proto.createUserRecord = function () {
    var self = this, user = {};
    user.displayName = this.passport.displayName;
    user.gender = this.passport.gender;
    return User.create(user)
      .then(function (user) {
        self.userRecord = user;
      });
  };

  proto.usePassportUser = function () {
    var self = this;
    this.userRecord = this.passportRecord.user;
    if (!_.isObject(this.userRecord)) {
      return User.findOne(this.userRecord)
        .then(function setUserRecordProperty(user) {
          self.userRecord = user;
        });
    }
    return this.resolve();
  };

  proto.createAndAssociatePassport = function () {
    var self = this;
    return this.userRecord
      .associatePassportAsync(this.type, this.identifier, this.passport)
      .then(function saveMainPassport(passport) {
        passport.lastLoginAt = new Date();
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
      .then(function setPassportRecordsPropertyAndCompleteUser(results) {
        var passport;
        for (var i = 0; i < results.length; i++) {
          if (results[i].isRejected()) {
            console.warn('associating a passport failed silently:', results[i].reason());
          }
          else {
            passport = results[i].value();
            self.passportRecords.push(passport);
          }
        }
      });
  };

  proto.reloadAndCompleteUser = function () {
    var self = this;
    return User.findOne(record.identify(this.userRecord))
      .then(function completeUserWithAllPassports(user) {
        self.userRecord = user;
        user.completeFromPassport(self.passportRecord);
        for (var i = 0; i < self.passportRecords.length; i++) {
          user.completeFromPassport(self.passportRecords[i]);
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
    this.passportRecord.lastLoginAt = new Date();
    return this.passportRecord.save();
  };

  proto.handleError = function (error) {
    console.warn('[passport] error in the process:', error);
    this.error = error;
    // TODO: handle each case of error to get a descriptive error
    return error;
  };

})(PassportConnection.prototype);


module.exports = PassportConnection;
