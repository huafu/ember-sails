str = require './string'

modelConstructorCache =
  _index: null
  index: ->
    unless (@_index)
      @_index = constructors: [], models: []
      for own name, model of sails.models
        @_index.constructors.push model._model.__bindData__[0]
        @_index.models.push model
    @_index
  modelForConstructor: (constructor) ->
    idx = @index()
    if (i = idx.constructors.indexOf(constructor)) >= 0
      idx.models[i]
    else
      undefined


self = module.exports =
  forName: (name) ->
    sails.models[name.replace(/[_\.-]/g, '').toLowerCase()]

  forRecord: (record) ->
    modelConstructorCache.modelForConstructor(record.constructor)

  for: (item) ->
    if _.isString(item)
      self.forName(item)
    else if (name = item?.globalId)
      self.forName(name)
    else if _.isObject(item)
      self.forRecord(item)
    else
      throw new ReferenceError('cannot get the model for ' + item)

  nameFor: (item) ->
    self.for(item).globalId

  primaryKeyNameFor: (item) ->
    self.for(item).primaryKey

  addGeoAttributes: (required = no, attributes = {}) ->
    if typeof required is 'object'
      attributes = required
      required = no
    attributes.latitude = { required, type: 'float' }
    attributes.longitude = { required, type: 'float' }
    attributes.geoExtra = { type: 'json' }
    attributes

  attributes:
    gender: (extension = {}) ->
      _.merge { type: 'string', enum: ['male', 'female', 'business', 'group'] }, extension

