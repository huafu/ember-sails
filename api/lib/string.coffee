string = module.exports =
  dasherize: (str, dash = '-') ->
    str.replace /[A-Z]+/g, (char) -> dash + char.toLowerCase()

  camelize: (str) ->
    str.replace(
      /^[A-Z]/, (str) -> (str ? '').toLowerCase()
    ).replace /[_\.\-]([a-z])?/g, (all, char) -> (char ? '').toUpperCase()

  capitalize: (str) ->
    str[0].toUpperCase() + str.substr(1)

  classify: (str) ->
    string.capitalize string.camelize(str)

  decapitalize: (str) ->
    str[0].toLowerCase() + str.substr(1)

  fmt: (str, args...) ->
    autoIndex = 0
    str.replace /%@([0-9]+)?/g, (all, index) ->
      if index
        index = parseInt(index, 10) - 1
      else
        index = autoIndex++
      args[index] ? ''

  interpolate: (str, params = {}) ->
    str.replace /([^\\])\{\{([^\}]+)\}\}/g, (all, prefix, key) ->
      "#{ prefix ? '' }#{ params[key] ? '' }"
