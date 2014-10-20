/**
 * Created by huafu on 10/20/14.
 */
var IndexController = {
  index: function (req, res, next) {
    res.view('index', {
      sessionUserJson: JSON.stringify(req.user ? req.user.toJSON() : {})
    });
  }
};

module.exports = IndexController;
