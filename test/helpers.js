var glob = GLOBAL;
var chai = require('chai');


/* ==== setting-up globals ============= */

glob.expect = chai.expect;
glob.sinon = require('sinon');
glob.Sails = require('sails');


/* ==== chai configuration ============= */

// disable truncating
chai.config.truncateThreshold = 0;
