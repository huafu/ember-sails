/**
 * Created by huafu on 10/10/14.
 */

var mdl = require('./model');

module.exports = {

  isShortcut: function (id) {
    if (id === 'find' || id === 'update' || id === 'create' || id === 'destroy') {
      return true;
    }
    return false;
  },

  parseFindOptions: function (req) {
    var params, where = req.param('where');
    if (_.isString(where)) {
      where = JSON.parse(where);
    }
    if (!where) {
      // Build monolithic parameter object
      params = req.params.all();
      params = _.omit(params, function (param, key) {
        return key === 'limit' || key === 'skip' || key === 'sort';
      });
      if (Object.keys(params).length) {
        where = params;
      }
      else {
        where = undefined;
      }
    }
    return {
      limit: req.param('limit') || undefined,
      skip:  req.param('skip') || undefined,
      sort:  req.param('sort') || undefined,
      where: where || undefined
    };
  },

  handleFind: function (model, req, res, next) {
    var Model = mdl.cast(model);
    var options, id = req.param('id');
    if (this.isShortcut(id)) {
      return next();
    }
    if (id) {
      Model.findOne(id, function (err, record) {
        if (record === undefined) {
          return res.notFound();
        }
        if (err) {
          return next(err);
        }
        res.json(record);
      }.bind(this));
    }
    else {
      options = this.parseFindOptions(req);
      Model.find(options, function (err, records) {
        if (records === undefined) {
          return res.notFound();
        }
        if (err) {
          return next(err);
        }
        res.json(records);
      }.bind(this));
    }
  },


  handleCreate: function (model, req, res, next) {
    var Model = mdl.cast(model);
    var params = req.params.all();
    Model.create(params, function (err, record) {
      if (err) {
        return next(err);
      }
      res.status(201);
      res.json(record);
    }.bind(this));
  },

  handleUpdate: function (model, req, res, next) {
    var Model = mdl.cast(model);
    var criteria;
    criteria = _.merge({}, req.params.all(), req.body);
    var id = req.param('id');
    if (!id) {
      return res.badRequest('No id provided.');
    }
    Model.update(id, criteria, function (err, record) {
      if (record.length === 0) {
        return res.notFound();
      }
      if (err) {
        return next(err);
      }
      res.json(record);
    }.bind(this));
  },


  handleDestroy: function (model, req, res, next) {
    var Model = mdl.cast(model);
    var id = req.param('id');
    if (!id) {
      return res.badRequest('No id provided.');
    }
    Model.findOne(id).done(function (err, result) {
      if (err) {
        return res.serverError(err);
      }
      if (!result) {
        return res.notFound();
      }
      Model.destroy(id, function (err) {
        if (err) {
          return next(err);
        }
        res.json(null);
      }.bind(this));
    }.bind(this));
  }
};
