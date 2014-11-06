var geoip = require('geoip-lite');
var ip = require('../lib/ip');
var str = require('../lib/string');

var geo = {
  /**
   * Return the geo localization from the given request if possible
   * @method fromRequest
   * @param {Object} req
   * @return {{geoExtra: Object, latitude: Number, longitude: Number}|null}
   */
  fromRequest: function (req) {
    var clientIp;
    if ((clientIp = ip.fromRequest(req))) {
      return geo.fromIp(clientIp);
    }
  },

  /**
   * Return the geo localization from the given IP if possible
   * @method fromIp
   * @param {String} clientIp
   * @return {{geoExtra: Object, latitude: Number, longitude: Number}|null}
   */
  fromIp: function (clientIp) {
    var res, location;
    if ((location = geoip.lookup(clientIp))) {
      sails.log.debug(str.fmt(
        '[geo] mapped IP %@ to %@, %@, %@',
        clientIp, location.city, location.region, location.country
      ));
      res = Object.create(null);
      res.geoExtra = Object.create(null);
      // TODO: retrieve country and region names
      if (location.country) {
        res.geoExtra.country = location.country;
      }
      if (location.region) {
        res.geoExtra.region = location.region;
      }
      if (location.city) {
        res.geoExtra.city = location.city;
      }
      res.geoExtra.ip = clientIp;
      res.latitude = location.ll[0];
      res.longitude = location.ll[1];
      return res;
    }
  }
};

module.exports = geo;
