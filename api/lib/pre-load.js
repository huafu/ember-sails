/**
 * Created by huafu on 10/22/14.
 */
require('coffee-script/register');
var logger = require('../lib/logger');

//////// EXTRA LOGGING //////////////////

logger.instrumentObjects({
  'PassportConnection.prototype': require('../services/passport/connection').prototype,
  'service:passport':             require('../services/passport'),
  'controller:auth':              require('../controllers/AuthController'),
  'model:user':                   require('../models/User'),
  'model:user.prototype':         require('../models/User').attributes,
  'model:passport':               require('../models/Passport'),
  'model:passport.prototype':     require('../models/Passport').attributes
});
/////////////////////////////////////////

