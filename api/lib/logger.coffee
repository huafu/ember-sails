logger =
  _debug: ->
    if sails?.log?.verbose
      sails.log.verbose arguments...
    else
      console.log arguments...

  _warn: ->
    if sails?.log?.warn
      sails.log.warn arguments...
    else
      console.warn arguments...

  _anonymousIndex: 0

  guessMethodName: (method) ->
    unless (res = (->).toString.call(method).match(/function([^\(]*)/)[1].replace(/(^\s+|\s+)$/g,
      ''))
      res = logger.autoNamespace()
    res

  autoNamespace: ->
    "[anonymous##{ ++logger._anonymousIndex }]"

  instrumentMethod: (method, name = logger.guessMethodName(method)) ->
    name = name.replace /\.prototype\./g, '#'
    logger._debug "[logger] instrumenting method #{ name }..."
    newMethod = ->
      isNew = @constructor is newMethod
      arrow = if isNew then '== new ==' else '== ( ) =='
      logger._debug "[logger] =#{ arrow }> entering #{ name }"
      try
        res = method.apply @, arguments
      catch err
        logger._warn "[logger] !! #{ name } threw #{ err }"
        err.captureStackTrace()
        throw err
      logger._debug "[logger] <#{ arrow }= exiting #{ name }"
      res
    newMethod.prototype = method.prototype
    for own k, v of method
      newMethod[k] = v
    newMethod

  instrumentObject: (object, namespace = logger.autoNamespace()) ->
    for own k, v of object when typeof v is 'function'
      object[k] = @instrumentMethod v, "#{ namespace }.#{ k }"
    logger

  instrumentObjects: (set) ->
    for own k, o of set
      logger.instrumentObject(o, k)
    logger

module.exports = logger
