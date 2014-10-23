var validator = require('validator');
var Promise = require('bluebird');

/**
 * Local Authentication Protocol
 *
 * The most widely used way for websites to authenticate users is via a username
 * and/or email as well as a password. This module provides functions both for
 * registering entirely new users, assigning passwords to already registered
 * users and validating login requesting.
 *
 * For more information on local authentication in Passport.js, check out:
 * http://passportjs.org/guide/username-password/
 */

/**
 * Register a new user
 *
 * This method creates a new user from a specified email, username and password
 * and assign the newly created user a local Passport.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.register = function (req, res, next) {
  var email = req.param('email'),
    username = req.param('username'),
    password = req.param('password'),
    displayName = req.param('displayName'),
    user = null,
    error = null;

  if (!email) {
    req.flash('error', 'Error.Passport.Email.Missing');
    return next(new Error('No email was entered.'));
  }

  if (!password) {
    req.flash('error', 'Error.Passport.Password.Missing');
    return next(new Error('No password was entered.'));
  }

  if (!displayName) {
    req.flash('error', 'Error.Passport.DisplayName.Missing');
    return next(new Error('No display name was entered.'));
  }

  User.create({ displayName: displayName })
    .then(function setUserVar(record) {
      user = record;
      return user;
    })
    .then(function associateEmailPassport() {
      return user
        .associatePassportAsync(PassportType.EMAIL, email, {protocol: 'local', password: password})
        .then(function setLastLoginDate(passport) {
          passport.lastLoginAt = new Date();
          return passport;
        })
        .then(function savePassport() {
          return passport.save();
        });
    })
    .then(function associateUsernamePassport() {
      if (username) {
        return user
          .associatePassportAsync(PassportType.USERNAME, username)
          .then(function saveUsernamePassport(passport) {
            return passport.save();
          });
      }
    })
    .then(function saveUser() {
      // will save passport associations and passport updates
      return user.save();
    })
    .catch(function handleError(err) {
      error = err;
      // delete the created user if any
      if (user) {
        return user
          .destroy()
          .finally(Promise.reject.bind(Promise, err));
      }
      else {
        return err;
      }
    })
    .finally(function sendResponse() {
      if (error) {
        req.flash('error', error);
        next(error);
      }
      else {
        next(null, user);
      }
    })
    .done();
};

/**
 * Assign local Passport to user
 *
 * This function can be used to assign a local Passport to a user who doens't
 * have one already. This would be the case if the user registered using a
 * third-party service and therefore never set a password.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
exports.connect = function (req, res, next) {
  var user = req.user,
    password = req.param('password'),
    email = req.param('email'),
    error = null;

  user.associatePassportAsync(PassportType.EMAIL, email, {protocol: 'local', password: password})
    .then(function savePassport(passport) {
      passport.lasLoginAt = new Date();
      return passport.save();
    })
    .then(function saveUser() {
      return user.save();
    })
    .catch(function handleError(err) {
      error = err;
      return err;
    })
    .finally(function sendResponse() {
      if (error) {
        req.flash('error', error);
        next(error);
      }
      else {
        next(null, user);
      }
    })
    .done();
};

/**
 * Validate a login request
 *
 * Looks up a user using the supplied identifier (email or username) and then
 * attempts to find a local Passport associated with the user. If a Passport is
 * found, its password is checked against the password supplied in the form.
 *
 * @param {Object}   req
 * @param {string}   identifier
 * @param {string}   password
 * @param {Function} next
 */
exports.login = function (req, identifier, password, next) {
  var isEmail = validator.isEmail(identifier),
    userRecord = null,
    error = null;

  if (!password) {
    req.flash('error', 'Error.Passport.Password.NotSet');
    return next(null, false);
  }
  if (!identifier) {
    req.flash('error', 'Error.Passport.Identifier.NotSet');
    return next(null, false);
  }

  User
    .findByPassport(isEmail ? PassportType.EMAIL : PassportType.USERNAME, identifier)
    .populate('email')
    .then(function checkUserPassword(user) {
      if (!user) {
        if (isEmail) {
          throw new Error('Error.Passport.Email.NotFound');
        }
        else {
          throw new Error('Error.Passport.Username.NotFound');
        }
      }
      else {
        userRecord = user;
        user.email.validatePassword(password);
      }
      return user;
    })
    .then(function updateLastLogin(user) {
      user.email.lastLoginAt = new Date();
      return user.email.save();
    })
    .catch(function handleError(err) {
      error = err;
      return err;
    })
    .finally(function sendResponse() {
      if (error) {
        req.flash('error', error);
        next(error);
      }
      else {
        next(null, userRecord);
      }
    })
    .done();
};
