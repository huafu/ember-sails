var ipware = require('ipware')();
var str = require('./string');

var ip = {
  fromRequest: function (request, onlyRoutable) {
    var ipInfo, map;
    if (onlyRoutable == null) {
      onlyRoutable = true;
    }
    if ((ipInfo = ipware.get_ip(request)) && ipInfo.clientIp) {
      if ((map = sails.config.ipMapping) && map[ipInfo.clientIp]) {
        ipInfo = map[ipInfo.clientIp];
      }
      sails.log.debug(str.fmt(
        '[ip] found client IP: %@ (%@routable)', ipInfo.clientIp, ipInfo.clientIpRoutable ? '' : 'not '
      ));
      if (!onlyRoutable || ipInfo.clientIpRoutable) {
        return ipInfo.clientIp;
      }
    }
    else {
      sails.log.debug('[ip] unable to find client IP');
    }
    return void 0;
  }
};

module.exports = ip;
