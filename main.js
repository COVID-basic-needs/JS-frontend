var infowindow = new google.maps.InfoWindow();
var latlng = new google.maps.LatLng(40.413993, -99.034504);

var map = new google.maps.Map(document.getElementById("map"), {
  zoom: 5,
  center: latlng,
  mapTypeId: google.maps.MapTypeId.ROADMAP
});

var geocoder = new google.maps.Geocoder();


//to center the map
function codeAddress() {

    var address = document.getElementById("zipCode").value;

    geocoder.geocode({
        'address': address,
        'componentRestrictions': {
            'country': 'US'
        }
    }, function (results, status) {

        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}


function createMarker(name, add,lat,lng) {

    var contentString = "Name " + name +'<br>' +
    "Address: " + add + '<br>'; //+
    // "Hours: " + hours + "<br>" +
    // "Contact Phone #: " + phone + "<br>" ;
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lng),
        map: map
    });   

   google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(contentString);
      infowindow.open(map,marker);
    });

}

createMarker("John Doe High School", "9351 Washington St, Thornton, CO 80229", 39.8664037, -104.9805197)

