
const searchMapsBtn = document.getElementById("searchMapsBtn");
const locationEngland = new google.maps.LatLng(52.467412, -1.648453);
let queryLocation = "";
const radiusMaps = "100";
let map;
const defaultZoom = 6;
const searchResultsZoom = 16;
let infoWindow = new google.maps.InfoWindow();
let marker;
let placeID;
let place;

searchMapsBtn.addEventListener('click', function (e) {
  // Clear all previous markers
  if(marker){
    marker.setMap(null);
  }

  queryLocation = document.getElementById('searchLocation').value;

  let request = {
    location: locationEngland,
    query: queryLocation,
    radius: radiusMaps,
  };

  let service = new google.maps.places.PlacesService(map);
  service.textSearch(request, function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        place = results[i];
        initMap(searchResultsZoom, place.geometry.location);
        createMarker(place);
        placeID = place.place_id;
      }
    }
  });
});

let createMarker = (place) => {
  let placeLoc = place.geometry.location;
  marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent(place.name);
    handleBarContext.placeName = place.name
    console.log("Context to compile is:")
    console.log(handleBarContext);
    console.log("Source to compile is:")
    console.log(handleBarSource);
    let handleBarstemplate = Handlebars.compile(handleBarSource);
    console.log("Template to compile is:")
    console.log(handleBarstemplate);
    let handleBarHtml = handleBarstemplate(handleBarContext);
    $("#popup").html(handleBarHtml);
    infoWindow.open(map, this);
  });
};



let initMap = (zoomVal, centerLocation) => {
  map = new google.maps.Map(document.getElementById('map'), {
    center: centerLocation,
    zoom: zoomVal
  });
}

initMap(defaultZoom, locationEngland);
