ipware = require('ipware')()
str = require './string'

ip =
  fromRequest: (request, onlyRoutable = true) ->
    if (ipInfo = ipware.get_ip request) && ipInfo.clientIp
      if (map = sails.config.ipMapping) and map[ipInfo.clientIp]
        ipInfo = map[ipInfo.clientIp]
      sails.log.debug str.fmt(
        '[ip] found client IP: %@ (%@routable)', ipInfo.clientIp, if ipInfo.clientIpRoutable then '' else 'not '
      )
      if not onlyRoutable or ipInfo.clientIpRoutable
        return ipInfo.clientIp
    else
      sails.log.debug '[ip] unable to find client IP'
    undefined

module.exports = ip;
