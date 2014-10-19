class ModelAttribute
  name:   null
  config: null

  constructor:  (@name, @config) ->

  isPrimaryKey: ->
    @config.primaryKey

  isRelationship: ->
    Boolean(@config.model or @config.collection)

  isAttribute: ->
    not @isRelationship() and not @isPrimaryKey()

  getName: -> @name

  getDefaultValue: ->
    @config.defaultsTo

  getRelationshipModelName: ->
    if (name = @config.model ? @config.collection)
      require('./Model').baseName(name)
    else
      undefined

  getRelationshipKind: ->
    if @isRelationship()
      if @config.model then 'belongsTo' else 'hasMany'
    else
      undefined

  getRelationshipInverse: ->
    @config.via

  toEmberDefinition: ->
    if @config.protected
      undefined
    else if @isAttribute()
      attr = ["'#{ Class.waterlineTypeToEmberType(@config.type) or 'string' }'"]
      if (def = @getDefaultValue()) isnt undefined
        attr.push "{defaultValue: #{ JSON.stringify def }}"
      "DS.attr(#{ attr.join(', ') })"
    else if @isRelationship()
      attr = ["'#{ @getRelationshipModelName() }'"]
      if (inv = @getRelationshipInverse())
        attr.push "{inverse: '#{ inv }'}"
      "DS.#{ @getRelationshipKind() }(#{ attr.join(', ') })"
    else
      undefined

  @waterlineTypeToEmberType: (type) ->
    {
    datetime: 'date'
    integer:  'number'
    float:    'number'
    email:    'string'
    }[type] ? type

Class = module.exports = ModelAttribute
