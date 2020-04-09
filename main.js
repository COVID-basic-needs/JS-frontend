//GOOGLE MAPS API INIT
var infowindow = new google.maps.InfoWindow();
var centerLat = 40.413993
var centerLng = -99.034504
var mapCenter = new google.maps.LatLng(centerLat, centerLng);

var map = new google.maps.Map(document.getElementById("map"), {
  zoom: 4,
  center: mapCenter,
  mapTypeId: google.maps.MapTypeId.ROADMAP
});

markerArray=[];

var geocoder = new google.maps.Geocoder();

//ALGOLIA SETUP
const client = algoliasearch('JWHPBFC4T1', '6eb371014c3bff23b98dde01a8ef1763');
const index = client.initIndex('prod_schools');  

var listTemplate = `<li>
    <a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1 siteName"></h5>
            <small class="distance"></small>
        </div>
        <p class="mb-1 collapsed"></p>
    <small></small>
</a></li>
`

var directionsIcon = `<svg class="bi bi-arrow-90deg-right" width="1.3rem" height="1.3rem" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" d="M9.896 2.396a.5.5 0 000 .708l2.647 2.646-2.647 2.646a.5.5 0 10.708.708l3-3a.5.5 0 000-.708l-3-3a.5.5 0 00-.708 0z" clip-rule="evenodd"/>
<path fill-rule="evenodd" d="M13.25 5.75a.5.5 0 00-.5-.5h-6.5a2.5 2.5 0 00-2.5 2.5v5.5a.5.5 0 001 0v-5.5a1.5 1.5 0 011.5-1.5h6.5a.5.5 0 00.5-.5z" clip-rule="evenodd"/>
</svg>`

var searchOptions = {
    valueNames: [ 'siteName', 'siteAddress', 'distance'],
    item: listTemplate
};

var searchList = new List('searchList', searchOptions);



function findResults(lat, lng, numberHits=20){

    index.search('', {

        aroundLatLng: lat + ", " + lng,
        // aroundRadius: 5000,
        hitsPerPage: numberHits
      }).then(({ hits }) => {
        searchList.clear()
        clearMarkers()
        hits.map(createMarker)
        setBounds()
        $( ".list li:first-of-type" ).trigger("click") //open infowindow for closest element
      });
}

function distance(mk1, mk2) {
    var R = 3958.8; // Radius of the Earth in miles
    var rlat1 = mk1.lat() * (Math.PI/180); // Convert degrees to radians
    var rlat2 = mk2.lat() * (Math.PI/180); // Convert degrees to radians
    var difflat = rlat2-rlat1; // Radian difference (latitudes)
    var difflon = (mk2.lng()-mk1.lng()) * (Math.PI/180); // Radian difference (longitudes)

    var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
    var roundedDistance = (Math.round(d * 10) / 10).toFixed(1);
    var string = roundedDistance.toString() + ' miles away';
    return string;
}

function setBounds(){
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markerArray.length; i++) {
        bounds.extend(markerArray[i].getPosition());
    }   
    map.fitBounds(bounds);
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
            mapCenter = results[0].geometry.location
            // map.setCenter(mapCenter);
            // map.setZoom(10);
            codedLat = results[0].geometry.location.lat();
            codedLng = results[0].geometry.location.lng();
            findResults(codedLat, codedLng);
        } else {
            console.log("Geocode was not successful for the following reason: " + status);
        }
    });
    
}

function clearMarkers() {
    for (var i = 0; i < markerArray.length; i++ ) {
      markerArray[i].setMap(null);
    }
    markerArray.length = 0;
}

function createMarker(hit) {
    var name = hit["siteName"]
    var add = hit["siteAddress"]
    var lat = hit["_geoloc"]["lat"]
    var lng = hit["_geoloc"]["lng"]
    var contact = hit["contactPhone"]
    var bfastTime = hit["breakfastTime"]
    var lunchTime = hit['lunchTime']
    var dinnerTime = hit['dinnerTime']

    var defaultContentString = name +'<br>' //+ "Address: " + add + '<br>';
    var contentString = "Address: " + add + '<br>'

    if(contact){
        contentString = contentString.concat("Contact Phone #: <a href='tel:", contact, "'>",contact,"</a><br>")
        console.log(contentString)
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
    console.log(defaultContentString.concat(contentString))

    var mapDirections = "https://www.google.com/maps/dir/Current+Location/"+ lat + "," + lng

    contentString = contentString.concat("<span class='directionLink'> <a target='_blank' href=", mapDirections,">Get Directions", directionsIcon, "</a>", "</span>")

    var markerLoc = new google.maps.LatLng(lat,lng);
    var marker = new google.maps.Marker({
        position: markerLoc,
        map: map
    });   
    markerArray.push(marker);


    searchList.add({siteName: name, siteAddress: add, distance: distance(markerLoc, mapCenter)})
    var searchResult = $( ".list li:last-of-type" );
    var searchResultLink = $( ".list li:last-of-type a" );
    var hiddenResult = $( ".list li:last-of-type a").children('p');
    hiddenResult.append(contentString)

    searchResult.click(function(self){
        infowindow.setContent(defaultContentString);
        infowindow.open(map, marker)

        $( ".list li a" ).removeClass('active');
        searchResultLink.toggleClass('active');

        $( ".list li a" ).children('p').addClass('collapsed');
        hiddenResult.removeClass('collapsed');
    })

   google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(defaultContentString);
        infowindow.open(map,marker);

        $( ".list li a" ).removeClass('active');
        searchResultLink.toggleClass('active');

        $( ".list li a" ).children('p').addClass('collapsed');
        hiddenResult.removeClass('collapsed');

        // $("#drawer").animate({
        //     scrollTop: searchResult.offset().top - $("#drawer").offset().top  + $("#drawer").scrollTop()
        // })
        searchResult[0].scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        })

    
    });

}
  
function runWithGeolocation(position) {
    mapCenter = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    // map.setCenter(mapCenter);
    // map.setZoom(10);
    findResults(position.coords.latitude, position.coords.longitude);

    geocoder.geocode({'location': mapCenter}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            $('#zipCode').val(results[0].formatted_address).parent().addClass('is-dirty');
        } else {
            console.log("Geocode was not successful for the following reason: ")
        }
    });
}

function init() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(runWithGeolocation);
    } else { 
      console.log("Geolocation is not supported by this browser.")
    }
}

$( document ).ready(function() {
    codeAddress('el paso');
    init()
});




