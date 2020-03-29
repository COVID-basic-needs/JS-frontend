var infowindow = new google.maps.InfoWindow();
var latlng = new google.maps.LatLng(40.413993, -99.034504);

var map = new google.maps.Map(document.getElementById("map"), {
  zoom: 5,
  center: latlng,
  mapTypeId: google.maps.MapTypeId.ROADMAP
});

var geocoder = new google.maps.Geocoder();

const client = algoliasearch('JWHPBFC4T1', '6eb371014c3bff23b98dde01a8ef1763');
const index = client.initIndex('us_foodbank');

function findResults(lat, lng){

    index.search('', {

        aroundLatLng: lat + ", " + lng,
        aroundRadius: 5000
      }).then(({ hits }) => {
        console.log(hits)
        hits.map(createMarker)
      });
}




//to center the map
function codeAddress() {
    var address = document.getElementById("zipCode").value;


    geocoder.geocode({
        'address': address,
        'componentRestrictions': {
            'country': 'US'
        }
    }, function (results, status) {
        var codedLat
        var codedLng

        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            map.setZoom(12);
            codedLat = results[0].geometry.location.lat();
            codedLng = results[0].geometry.location.lng();
            findResults(codedLat, codedLng);
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
    
}


function createMarker(hit) {
    console.log(hit)
    var name = hit["siteName"]
    var add = hit["siteAddress"]
    var lat = hit["_geoloc"]["lat"]
    var lng = hit["_geoloc"]["lng"]

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


