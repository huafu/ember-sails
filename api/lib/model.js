/**
 * Created by huafu on 10/10/14.
 */

module.exports = {

  cast: function (nameOrClass) {
    if (_.isString(nameOrClass)) {
      return _.find(sails.models, {globalId: nameOrClass});
    }
    return nameOrClass;
  }

};
