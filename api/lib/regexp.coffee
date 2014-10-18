regexp = module.exports =
  escape: (str) ->
    str.replace /[-\/\\^$*+?.()|[\]{}]/g, '\\$&'
