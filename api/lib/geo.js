var geoip = require('geoip-lite');
var ipware = require('ipware');

var geo = {
  /**
   * Return the geo localization from the given request if possible
   * @method fromRequest
   * @param {Object} req
   * @return {{geoExtra: Object, latitude: Number, longitude: Number}|null}
   */
  fromRequest: function (req) {
    var res, location, ipInfo = ipware.get_ip(req);
    if (ipInfo && ipInfo.clientIpRoutable) {
      location = geoip.lookup(ipInfo.clientIp);
      res = Object.create(null);
      res.geoExtra = Object.create(null);
      // TODO: retrieve country and region names
      res.geoExtra.country = location.country;
      res.geoExtra.region = location.region;
      res.geoExtra.city = location.city;
      res.geoExtra.ip = ipInfo.clientIp;
      res.latitude = res.ll[0];
      res.longitude = res.ll[1];
      return res;
    }
  }
};

module.exports = geo;
