logger =
  _anonymousIndex: 0

  guessMethodName: (method) ->
    unless (res = (->).toString.call(method).match(/function([^\(]*)/)[1].replace(/(^\s+|\s+)$/g, ''))
      res = logger.autoNamespace()
    res

  autoNamespace: ->
    "[anonymous##{ ++logger._anonymousIndex }]"

  instrumentMethod: (method, name = logger.guessMethodName(method)) ->
    name = name.replace /\.prototype\./g, '#'
    console.log "[logger] instrumenting method #{ name }..."
    newMethod = ->
      isNew = @constructor is newMethod
      arrow = if isNew then '== new ==' else '== ( ) =='
      console.log "[logger] =#{ arrow }> entering #{ name }"
      try
        res = method.apply @, arguments
      catch err
        console.warn "[logger] !! #{ name } threw #{ err }"
        err.captureStackTrace()
        throw err
      console.log "[logger] <#{ arrow }= exiting #{ name }"
      res
    newMethod.prototype = method.prototype
    for own k, v of method
      newMethod[k] = v
    newMethod

  instrumentObject: (object, namespace = logger.autoNamespace()) ->
    for own k, v of object when typeof v is 'function'
      object[k] = @instrumentMethod v, "#{ namespace }.#{ k }"
    @

module.exports = logger
