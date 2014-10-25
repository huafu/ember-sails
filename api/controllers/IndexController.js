/**
 * Created by huafu on 10/20/14.
 */
var Promise = require('bluebird');

var IndexController = {

  index: function (req, res, next) {
    var val;
    Promise.props({
      passportTypes:      PassportType.find(),
      geoLocationTypes:   GeoLocationType.find(),
      geoLocationSources: GeoLocationSource.find(),
      activityTypes:      ActivityType.find()
    })
      .then(function render(store) {
        if(req.user){
          req.user.flatInjectInPayload(store);
        }
        res.view('index', {
          storeJson:       JSON.stringify(store),
          sessionUserId: req.user ? req.user.id : ''
        });
      }, next);
  }

};

module.exports = IndexController;
