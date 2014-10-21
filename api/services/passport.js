var path = require('path'),
  url = require('url'),
  pass = require('passport'),
  record = require('../lib/record'),
  str = require('../lib/string');

/**
 * Passport Service
 *
 * A painless Passport.js service for your Sails app that is guaranteed to
 * Rock Your Socks™. It takes all the hassle out of setting up Passport.js by
 * encapsulating all the boring stuff in two functions:
 *
 *   pass.endpoint()
 *   pass.callback()
 *
 * The former sets up an endpoint (/auth/:provider) for redirecting a user to a
 * third-party provider for authentication, while the latter sets up a callback
 * endpoint (/auth/:provider/callback) for receiving the response from the
 * third-party provider. All you have to do is define in the configuration which
 * third-party providers you'd like to support. It's that easy!
 *
 * Behind the scenes, the service stores all the data it needs within "Pass-
 * ports". These contain all the information required to associate a local user
 * with a profile from a third-party provider. This even holds true for the good
 * ol' password authentication scheme – the Authentication Service takes care of
 * encrypting passwords and storing them in Passports, allowing you to keep your
 * User model free of bloat.
 */

// Load authentication protocols
pass.protocols = require('./protocols');

/**
 * Connect a third-party profile to a local user
 *
 * This is where most of the magic happens when a user is authenticating with a
 * third-party provider. What it does, is the following:
 *
 *   1. Given a provider and an identifier, find a matching Passport.
 *   2. From here, the logic branches into two paths.
 *
 *     - A user is not currently logged in:
 *       1. If a Passport wassn't found, create a new user as well as a new
 *          Passport that will be assigned to the user.
 *       2. If a Passport was found, get the user associated with the passport.
 *
 *     - A user is currently logged in:
 *       1. If a Passport wasn't found, create a new Passport and associate it
 *          with the already logged in user (ie. "Connect")
 *       2. If a Passport was found, nothing needs to happen.
 *
 * As you can see, this function handles both "authentication" and "authorization"
 * at the same time. This is due to the fact that we pass in
 * `passReqToCallback: true` when loading the strategies, allowing us to look
 * for an existing session in the request and taking action based on that.
 *
 * For more information on authentication/authorization in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 * http://passportjs.org/guide/authorize/
 *
 * @param {Object}   req
 * @param {Object}   query
 * @param {Object}   profile
 * @param {Function} next
 */
pass.connect = function (req, query, profile, next) {
  var providerPassport = {},
    passports = [],
    userRecord = req.user || null,
    error = null,
    provider, identifier;

  // Use profile.provider or fallback to the query.provider if it is undefined
  // as is the case for OpenID, for example
  provider = profile.provider || req.param('provider');
  identifier = query.identifier.toString();
  // fill up our provider passport
  providerPassport.identifier = identifier;
  providerPassport.type = provider;

  // If the provider cannot be identified we cannot match it to a passport so
  // throw an error and let whoever's next in line take care of it.
  if (!provider) {
    return next(new Error('No authentication provider given.'));
  }
  if (!identifier) {
    return next(new Error('No authentication identifier given.'));
  }

  // If the profile object contains a list of emails...
  if (profile.hasOwnProperty('emails') && profile.emails.length) {
    passports.push.apply(passports, _.map(profile.emails, function (email) {
      return {type: PassportType.EMAIL, identifier: email.value};
    }));
  }
  // If the profile object contains a username...
  if (profile.hasOwnProperty('username') && profile.username) {
    passports.push({type: PassportType.USERNAME, identifier: profile.username});
  }
  // If the profile object contains a displayName...
  if (profile.hasOwnProperty('displayName') && profile.displayName) {
    providerPassport.displayName = profile.displayName;
  }

  // If we got an avatar for this provider, add it
  if (profile.hasOwnProperty('photos') && profile.photos.length) {
    providerPassport.avatarUrl = profile.photos[0].value;
  }

  // If we got a profile URL for this provider, add it
  if (profile.hasOwnProperty('profileUrl') && profile.profileUrl) {
    providerPassport.profileUrl = profile.profileUrl;
  }

  // Get the tokens
  if (query.hasOwnProperty('tokens') && query.tokens) {
    providerPassport.tokens = query.tokens;
  }

  // Get the protocol
  if (query.hasOwnProperty('protocol') && query.protocol) {
    providerPassport.protocol = query.protocol;
  }

  Passport
    .findByTypeAndIdentifier(provider, identifier)
    .populate('user')
    .then(function (passport) {
      if (!userRecord) {
        // Scenario: A new user is attempting to sign up using a third-party
        //           authentication provider.
        // Action:   Create a new user and assign them a passport.
        if (!passport) {
          return User
            .create({})
            .then(function registerCreatedUser(user) {
              userRecord = user;
              return user;
            })
            .then(function associateProviderPassport() {
              return userRecord.associatePassportAsync(provider, identifier, providerPassport);
            })
            .then(function saveProviderPassport(passport) {
              return passport.save();
            })
            .then(function associateSecondaryPassports() {
              // here we don't care if some are failing, our main one is saved already
              return userRecord.associatePassportsAsync(passports, 'settle', true);
            })
            .tap(function logPossibleSecondaryPassportsSaveErrors(results) {
              for (var i = 0; i < results.length; i++) {
                if (results[i].isRejected()) {
                  console.warn('associating a passport failed silently:', results[i].reason());
                }
              }
            })
            .then(function saveUser() {
              return userRecord.save();
            });
        }
        // Scenario: An existing user is trying to log in using an already
        //           connected passport.
        // Action:   Get the user associated with the passport.
        else {
          // If the tokens have changed since the last session, update them
          if (providerPassport.tokens) {
            passport.tokens = providerPassport.tokens;
          }
          // update other attributes if they were empty
          if (!passport.avatarUrl && providerPassport.avatarUrl) {
            passport.avatarUrl = providerPassport.avatarUrl;
          }
          if (!passport.displayName && providerPassport.displayName) {
            passport.displayName = providerPassport.displayName;
          }
          // Save any updates to the Passport before moving on
          return passport
            .save()
            .then(function associateSecondaryPassports() {
              // here we don't care if some are failing, our main one is saved already
              return userRecord.associatePassportsAsync(passports, 'settle', true);
            })
            .tap(function logPossibleSecondaryPassportsSaveErrors(results) {
              for (var i = 0; i < results.length; i++) {
                if (results[i].isRejected()) {
                  console.warn('associating a passport failed silently:', results[i].reason());
                }
              }
            })
            .then(function saveUser() {
              return userRecord.save();
            });
        }
      }
      else {
        // Scenario: A user is currently logged in and trying to connect a new
        //           passport.
        // Action:   Create and assign a new passport to the user.
        if (!passport) {
          userRecord
            .associatePassportAsync(provider, identifier, providerPassport)
            .then(function savePassport(passport) {
              return passport.save();
            })
            .then(function associateSecondaryPassports() {
              // here we don't care if some are failing, our main one is saved already
              return userRecord.associatePassportsAsync(passports, 'settle', true);
            })
            .tap(function logPossibleSecondaryPassportsSaveErrors(results) {
              for (var i = 0; i < results.length; i++) {
                if (results[i].isRejected()) {
                  console.warn('associating a passport failed silently:', results[i].reason());
                }
              }
            })
            .then(function saveUser() {
              return userRecord.save();
            });
        }
        // Scenario: The user is a nutjob or spammed the back-button.
        // Action:   Simply pass along the already established session.
        else {
          return Promise.resolve(userRecord);
        }
      }
    })
    .catch(function handleError(err) {
      // TODO: handle all different cases correctly (might have to add catch blocks upstream
      error = err;
    })
    .finally(function sendResponse() {
      if (error) {
        req.flash(error);
        next(error);
      }
      else {
        next(null, userRecord);
      }
    })
    .done();
};

/**
 * Create an authentication endpoint
 *
 * For more information on authentication in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 *
 * @param  {Object} req
 * @param  {Object} res
 */
pass.endpoint = function (req, res) {
  var strategies = sails.config.passport,
    provider = req.param('provider'),
    options = {};

  // If a provider doesn't exist for this endpoint, send the user back to the
  // login page
  if (!strategies.hasOwnProperty(provider)) {
    return res.redirect('/login');
  }

  // Attach scope if it has been set in the config
  if (strategies[provider].hasOwnProperty('scope')) {
    options.scope = strategies[provider].scope;
  }

  // Redirect the user to the provider for authentication. When complete,
  // the provider will redirect the user back to the application at
  //     /auth/:provider/callback
  this.authenticate(provider, options)(req, res, req.next);
};

/**
 * Create an authentication callback endpoint
 *
 * For more information on authentication in Passport.js, check out:
 * http://passportjs.org/guide/authenticate/
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
pass.callback = function (req, res, next) {
  var provider = req.param('provider', 'local'),
    action = req.param('action');

  // Passport.js wasn't really built for local user registration, but it's nice
  // having it tied into everything else.
  if (provider === 'local' && action !== undefined) {
    if (action === 'register' && !req.user) {
      this.protocols.local.register(req, res, next);
    }
    else if (action === 'connect' && req.user) {
      this.protocols.local.connect(req, res, next);
    }
    else if (action === 'disconnect' && req.user) {
      this.protocols.local.disconnect(req, res, next);
    }
    else {
      next(new Error('Invalid action'));
    }
  }
  else {
    if (action === 'disconnect' && req.user) {
      this.disconnect(req, res, next);
    }
    else {
      // The provider will redirect the user to this URL after approval. Finish
      // the authentication process by attempting to obtain an access token. If
      // access was granted, the user will be logged in. Otherwise, authentication
      // has failed.
      this.authenticate(provider, next)(req, res, req.next);
    }
  }
};

/**
 * Load all strategies defined in the Passport configuration
 *
 * For example, we could add this to our config to use the GitHub strategy
 * with permission to access a users email address (even if it's marked as
 * private) as well as permission to add and update a user's Gists:
 *
 github: {
      name: 'GitHub',
      protocol: 'oauth2',
      strategy: require('passport-github').Strategy
      scope: [ 'user', 'gist' ]
      options: {
        clientID: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET'
      }
    }
 *
 * For more information on the providers supported by Passport.js, check out:
 * http://passportjs.org/guide/providers/
 *
 */
pass.loadStrategies = function () {
  var self = this,
    strategies = sails.config.passport;

  Object.keys(strategies).forEach(function (key) {
    var options = { passReqToCallback: true }, Strategy;

    if (key === 'local') {
      // Since we need to allow users to login using both usernames as well as
      // emails, we'll set the username field to something more generic.
      _.extend(options, { usernameField: 'identifier' });

      // Only load the local strategy if it's enabled in the config
      if (strategies.local) {
        Strategy = strategies[key].strategy;

        self.use(new Strategy(options, self.protocols.local.login));
      }
    }
    else {
      var protocol = strategies[key].protocol,
        callback = strategies[key].callback;

      if (!callback) {
        callback = path.join('auth', key, 'callback');
      }

      Strategy = strategies[key].strategy;

      var baseUrl = sails.getBaseurl();

      switch (protocol) {
        case 'oauth':
        case 'oauth2':
          options.callbackURL = url.resolve(baseUrl, callback);
          break;

        case 'openid':
          options.returnURL = url.resolve(baseUrl, callback);
          options.realm = baseUrl;
          options.profile = true;
          break;
      }

      // Merge the default options with any options defined in the config. All
      // defaults can be overridden, but I don't see a reason why you'd want to
      // do that.
      _.extend(options, strategies[key].options);

      self.use(new Strategy(options, self.protocols[protocol]));
    }
  });
};

/**
 * Disconnect a passport from a user
 *
 * @param  {Object} req
 * @param  {Object} res
 */
pass.disconnect = function (req, res, next) {
  var passports,
    user = req.user,
    provider = req.param('provider'),
    identifier = req.param('identifier');

  // try to find the identifier
  if (!identifier) {
    passports = user.populatedPassports(provider);
    if (passports.length > 1) {
      return next(new Error(str.fmt(
        'cannot guess the identity to disconnect, found %@ %@ connected identities',
        passports.length, provider
      )));
    }
    else if (passports.length < 1) {
      return next(new Error(str.fmt(
        'cannot disconnect a %@ identity, none found',
        passports.length, provider
      )));
    }
    identifier = record.primaryKeyValueFor(passports[0]);
  }

  user.dissociatePassportAsync(provider, identifier)
    .then(function saveUserAndPassport() {
      return user.save();
    })
    .then(function (user) {
      next(null, user);
      return user;
    }, next);
};

pass.serializeUser(function (user, next) {
  next(null, user.id);
});

pass.deserializeUser(function (id, next) {
  User.findOne(id).populateAll().exec(next);
});

module.exports = pass;
