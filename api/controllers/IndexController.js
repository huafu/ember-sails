/**
 * Created by huafu on 10/20/14.
 */
var Promise = require('bluebird');

var IndexController = {

  index: function (req, res, next) {
    Promise.props({
      passportTypes:      PassportType.find(),
      geoLocationTypes:   GeoLocationType.find(),
      geoLocationSources: GeoLocationSource.find(),
      activityTypes:      ActivityType.find()
    })
      .then(function render(store) {
        res.view('index', {
          storeJson:       JSON.stringify(store),
          sessionUserJson: JSON.stringify(req.user || {})
        });
      }, next);
  }

};

module.exports = IndexController;
