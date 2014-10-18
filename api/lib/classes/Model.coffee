fs = require 'fs'
sysPath = require 'path'

str = require '../string'
modelsConfig = require('../../../config/models').models

ModelAttribute = require './ModelAttribute'

MODELS_PATH = sysPath.resolve sysPath.join(__dirname, '..', '..', 'models')
EMBER_MODELS_PATH = sysPath.resolve(
  sysPath.join(__dirname, '..', '..', '..', 'ember', 'app', 'models')
)
EMBER_TEMPLATE = '''
import DS from 'ember-data';

export default {{source}};

'''

class Model
  name: null
  config: null
  attributesCache: null


  constructor: (name, @config) ->
    @name = Class.baseName name
    @attributesCache = {}


  getName: -> @name


  getAttribute: (name) ->
    if @attributesCache.hasOwnProperty(name)
      attr = @attributesCache[name]
    else
      if (def = @config.attributes[name])
        attr = new ModelAttribute(name, def)
      else
        if (name is 'createdAt' and modelsConfig.autoCreatedAt) or
        (name is 'updatedAt' and modelsConfig.autoUpdatedAt)
          attr = new ModelAttribute(name, {type: 'datetime', required: yes})
        else if name is 'id' and (@config.autoPk ? modelsConfig.autoPk)
          attr = new ModelAttribute(name, {primaryKey: yes, required: yes})
        else
          attr = undefined
      @attributesCache[name] = attr
    attr


  getAllAttributes: ->
    @getAttribute(name) for name in @getAllAttributeNames()


  getAllAttributeNames: ->
    res = []
    autoPk = @config.autoPk ? modelsConfig.autoPk
    res.push('id') if autoPk
    res = res.concat(Object.keys @config.attributes)
    res.push('createdAt') if modelsConfig.autoCreatedAt
    res.push('updatedAt') if modelsConfig.autoUpdatedAt
    res

  getFilePath: ->
    Class.nameToFilePath @name


  getEmberFilePath: ->
    Class.nameToEmberFilePath @name


  toEmberDefinition: (indent = '  ') ->
    all = []
    for attr in @getAllAttributes() when (def = attr.toEmberDefinition())
      all.push "#{ indent }#{ attr.getName() }: #{def}"
    "DS.Model.extend({\n#{ all.join ',\n\n' }\n})"


  writeEmberModelFile: (override = no) ->
    file = @getEmberFilePath()
    exists = fs.existsSync file
    if not override and exists
      fs.writeFileSync "#{ file }.orig", fs.readFileSync(file)
      console.info "backing up `#{ @getName() }` into `#{ file }.orig`"
    fs.writeFileSync file, str.interpolate(EMBER_TEMPLATE, source: @toEmberDefinition())

  # ---- static methods ----

  @dict: {}


  @factory: (name) ->
    name = name[0].toLowerCase() + name.substr(1)
    if @dict.hasOwnProperty(name)
      model = @dict[name]
    else
      source = @nameToFilePath name
      try def = require source
      if def
        model = new Class(name, def)
      else
        model = undefined
      @dict[name] = model
    model


  @baseName: (name) ->
    str.decapitalize(str.classify name)


  @nameToFilePath: (name, extension = '') ->
    sysPath.join(MODELS_PATH, str.capitalize(@baseName name)) + extension


  @nameToEmberFilePath: (name, extension = '.js') ->
    sysPath.join(EMBER_MODELS_PATH, str.dasherize(@baseName name)) + extension


  @all: ->
    res = []
    for file in fs.readdirSync(MODELS_PATH) when /\.(js|coffee)$/.test(file)
      res.push @factory(file.replace /\.(js|coffee)$/, '')
    res


Class = module.exports = Model
