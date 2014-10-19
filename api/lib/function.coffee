self = module.exports =
  wrap: (method, args..., wrapper) ->
    -> wrapper.call @, method, args..., arguments

  wrapConstructor: (Class, args..., wrapper) ->
    class __dynamic__ extends Class
      constructor: ->
        wrapper.call @, __dynamic__.__super__.constructor, args..., arguments
