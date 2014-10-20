import GoogleMapComponent from '../components/google-map';

export var initialize = function (container, application) {
  application.register(
    'controller:google-map/marker',
    GoogleMapComponent.GoogleMapMarkerController,
    {singleton: false}
  );
  application.register(
    'controller:google-map/markers',
    GoogleMapComponent.GoogleMapMarkersController,
    {singleton: false}
  );
};

export default {
  name: 'google-map',

  initialize: initialize
};
