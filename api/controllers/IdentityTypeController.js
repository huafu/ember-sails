/**
 * IdentityTypeController
 *
 * @description :: Server-side logic for managing IdentityTypes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */


function isShortcut(id) {
  if (id === 'find' || id === 'update' || id === 'create' || id === 'destroy') {
    return true;
  }
}

module.exports = {



  /**
   * `IdentityTypeController.find()`
   */
  find: function (req, res, next) {
    var where, params, options, id = req.param('id');

    if (isShortcut(id)) {
      return next();
    }

    if (id) {
      IdentityType.findOne(id, function (err, record) {
        if (record === undefined) {
          return res.notFound();
        }
        if (err) {
          return next(err);
        }
        res.json(record);
      });
    }
    else {
      where = req.param('where');
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
      options = {
        limit: req.param('limit') || undefined,
        skip:  req.param('skip') || undefined,
        sort:  req.param('sort') || undefined,
        where: where || undefined
      };

      IdentityType.find(options, function (err, record) {
        if (record === undefined) {
          return res.notFound();
        }
        if (err) {
          return next(err);
        }
        res.json(record);
      });

    }
  },


  /**
   * `IdentityTypeController.create()`
   */
  create: function (req, res) {
    return res.json({
      todo: 'create() is not implemented yet!'
    });
  },


  /**
   * `IdentityTypeController.update()`
   */
  update: function (req, res) {
    return res.json({
      todo: 'update() is not implemented yet!'
    });
  },


  /**
   * `IdentityTypeController.destroy()`
   */
  destroy: function (req, res) {
    return res.json({
      todo: 'destroy() is not implemented yet!'
    });
  }
};

