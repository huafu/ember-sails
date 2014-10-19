var validator = require('validator');

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
    user = null;

  if (!email) {
    req.flash('error', 'Error.Passport.Email.Missing');
    return next(new Error('No email was entered.'));
  }

  if (!password) {
    req.flash('error', 'Error.Passport.Password.Missing');
    return next(new Error('No password was entered.'));
  }

  User.create({
  })
    .then(function setupUserVar(record) {
      user = record;
    })
    .then(function associateEmailPassport() {
      return user.associatePassportAsync(PassportType.EMAIL, email, {protocol: 'local', password: password});
    })
    .then(function associateUsernamePassport() {
      if (username) {
        return user.associatePassportAsync(PassportType.USERNAME, username);
      }
    })
    .then(function saveUser() {
      // will save passport associations and passport updates
      return user.save();
    })
    .then(function () {
      // all done, return our new registered user
      next(null, user);
    })
    .fail(function (err) {
      if (err.code === 'E_VALIDATION') {
        if (err.invalidAttributes.email) {
          req.flash('error', 'Error.Passport.Email.Exists');
        }
        else if (err.invalidAttributes.password) {
          req.flash('error', 'Error.Passport.Password.Invalid');
        }
        else {
          req.flash('error', 'Error.Passport.User.Exists');
        }
      }
      // delete the created user if any
      if (user) {
        user.destroy(function (destroyErr) {
          next(destroyErr || err);
        });
      }
      else {
        next(err);
      }
    });
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
    email = req.param('email');

  user.associatePassportAsync(PassportTpye.EMAIL, email, {protocol: 'local', password: password})
    .then(function saveUser() {
      return user.save();
    })
    .then(function (user) {
      next(null, user);
    }, next);
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
  var isEmail = validator.isEmail(identifier);

  if (!password) {
    req.flash('error', 'Error.Passport.Password.NotSet');
    return next(null, false);
  }
  if (!identifier) {
    req.flash('error', 'Error.Passport.Identifier.NotSet');
    return next(null, false);
  }

  User
    .findByPassport(isEmail ? PassportTpye.EMAIL : PassportType.USERNAME, identifier)
    .then(function checkUserPassword(user) {
      if (!user) {
        if (isEmail) {
          req.flash('error', 'Error.Passport.Email.NotFound');
        }
        else {
          req.flash('error', 'Error.Passport.Username.NotFound');
        }

        next(null, false);
      }
      else {
        // email has been populated automatically by `User.findByPassport`
        user.email.validatePassword(password)
          .then(function (res) {
            if (!res) {
              req.flash('error', 'Error.Passport.Password.Wrong');
              return next(null, false);
            }
            next(null, user);
          }, next);
      }
    }, next);
};
