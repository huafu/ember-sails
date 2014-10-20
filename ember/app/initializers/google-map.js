import MarkerController from '../components/google-map/controllers/marker';
import MarkerView from '../components/google-map/views/marker';

export var initialize = function (container, application) {

  application.register('controller:google-map/marker', MarkerController, {singleton: false});

  application.register('view:google-map/marker', MarkerView, {singleton: false});

};

export default {
  name: 'google-map',

  initialize: initialize
};
