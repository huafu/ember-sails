model = require './model'

self = module.exports =
  ###*
    Get the primary key value of a record

    @param {Object} record
    @return {String|Number}
  ###
  primaryKeyValueFor: (record) ->
    pk = model.primaryKeyNameFor(record)
    record[pk]

  ###*
    If a record is given, returns its primary key value, else return what is given
    Check if the record is of `Model` if given

    @param {Object|String|Number} recordOrId
    @param {Model|String} [Model]
    @return {String|Number}
  ###
  identify: (recordOrId, Model) ->
    if _.isObject(recordOrId)
      if Model
        Model = model.modelFor(Model)
        if not Model or model.forRecord(recordOrId) isnt Model
          throw new TypeError("given record must be of model `#{ model.nameFor(Model) }`")
      self.primaryKeyValueFor(recordOrId)
    else
      recordOrId

  ###*
    Check if the 2 primary key values given are the same (or pk or given records)

    @param {Object|String|Number} recordOrId1
    @param {Object|String|Number} recordOrId2
    @return {Boolean}
  ###
  isSamePrimaryKey: (recordOrId1, recordOrId2) ->
    id1 = self.identify(recordOrId1)
    id2 = self.identify(recordOrId2)
    if id1 and id2
      "#{id1}" is "#{id2}"
    else
      no
