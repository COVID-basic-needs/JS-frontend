var infowindow = new google.maps.InfoWindow();
var latlng = new google.maps.LatLng(45.6770, -111.0429);

var map = new google.maps.Map(document.getElementById("map"), {
  zoom: 6,
  center: latlng,
  mapTypeId: google.maps.MapTypeId.ROADMAP
});

var geocoder = new google.maps.Geocoder();

const client = algoliasearch('JWHPBFC4T1', '6eb371014c3bff23b98dde01a8ef1763');
const index = client.initIndex('us_foodbank');  

var searchOptions = {
    valueNames: [ 'siteName', 'siteAddress' ],
    item: '<li><h6 class="siteName"></h6></li>'
};

var searchList = new List('searchList', searchOptions);

function findResults(lat, lng, numberHits=20){

    index.search('', {

        aroundLatLng: lat + ", " + lng,
        // aroundRadius: 5000,
        hitsPerPage: numberHits
      }).then(({ hits }) => {
        searchList.clear()
        hits.map(createMarker)
      });
}

//to center the map
function codeAddress(address) {

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

$('#submit').click(function(){
    codeAddress($("#zipCode").val())
});

function createMarker(hit) {
    var name = hit["siteName"]
    var add = hit["siteAddress"]
    var lat = hit["_geoloc"]["lat"]
    var lng = hit["_geoloc"]["lng"]
    var contact = hit["contactPhone"]
    var bfastTime = hit["breakfastTime"]
    var lunchTime = hit['lunchTime']
    var dinnerTime = hit['dinnerTime']

    var contentString = "Name: " + name +'<br>' + "Address: " + add + '<br>';

    if(contact){
        contentString = contentString.concat("Contact Phone #: ", contact, "<br>" )
    }

    if(bfastTime){
        contentString = contentString.concat("Breakfast Time: ", bfastTime, "<br>" )
    }

    if(lunchTime){
        contentString = contentString.concat("Lunch Time: ", lunchTime, "<br>" )
    }

    if(dinnerTime){
        contentString = contentString.concat("Dinner Time: ", dinnerTime, "<br>" )
    }

    console.log(contact)
    console.log(contentString)
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lng),
        map: map
    });   


    searchList.add({siteName: name, siteAddress: add})
    var searchResult = $( ".list li:last-of-type" );

    searchResult.click(function(self){
        infowindow.setContent(contentString);
        infowindow.open(map, marker)
        $( ".list li" ).removeClass('hovered');
        $(this).toggleClass('hovered');
    })

   google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contentString);
        infowindow.open(map,marker);
        $("#drawer").animate({
            scrollTop: searchResult.offset().top - $("#drawer").offset().top  + $("#drawer").scrollTop()
        })
        $( ".list li" ).removeClass('hovered');
        searchResult.toggleClass('hovered');

    
    });

}

function init() {
    findResults(latlng.lat(),latlng.lng(),400)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(runWithGeolocation);
    } else { 
      console.log("Geolocation is not supported by this browser.")
    }
}
  
function runWithGeolocation(position) {
    var coordinates = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    map.setCenter(coordinates);
    map.setZoom(12);
    findResults(position.coords.latitude, position.coords.longitude);
}

$( document ).ready(function() {
    init()
});