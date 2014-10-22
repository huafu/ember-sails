self = module.exports =

  dasherize: (str, dash = '-') ->
    str.replace /[A-Z]+/g, (char) -> dash + char.toLowerCase()


  camelize: (str) ->
    str.replace(
      /^[A-Z]/, (str) -> (str ? '').toLowerCase()
    ).replace /[_\.\-]([a-z])?/g, (all, char) -> (char ? '').toUpperCase()


  capitalize: (str) ->
    str[0].toUpperCase() + str.substr(1)


  classify: (str) ->
    self.capitalize self.camelize(str)


  decapitalize: (str) ->
    str[0].toLowerCase() + str.substr(1)


  fmt: (str, args...) ->
    autoIndex = 0
    if args.length is 1 and typeof args[0] instanceof Array
      args = args[0]
    str.replace /%@([0-9]+)?/g, (all, index) ->
      if index
        index = parseInt(index, 10) - 1
      else
        index = autoIndex++
      args[index] ? ''


  interpolate: (str, params = {}) ->
    str.replace /([^\\])\{\{([^\}]+)\}\}/g, (all, prefix, key) ->
      "#{ prefix ? '' }#{ params[key] ? '' }"


  trim: (str, charsPattern = null) ->
    if charsPattern
      re = new RegExp("(^[#{ charsPattern }]+|[#{ charsPattern }]+$)", 'g')
    else
      re = /(^\s+|\s+$)/g
    str.replace re, ''


  humanize: (str) ->
    self.decapitalize self.dasherize(
      self.trim(str, '\\s_\\.\\-')
    ).replace(/[^a-z0-9]+/gi, ' ')
