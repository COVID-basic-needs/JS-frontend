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

var searchOptions = {
    valueNames: [ 'siteName', 'siteAddress' ],
    item: '<li><h6 class="siteName"></h6> <div class="collapsed"></div></li>'
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
            console.log("Geocode was not successful for the following reason: " + status);
        }
    });
    
}

$('#submit').click(function(){
    codeAddress($("#zipCode").val())
});

$('body').on('keypress', '#zipCode', function(args) {
    if (args.keyCode == 13) {
        $('#submit').click();
        return false;
    }
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
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lng),
        map: map
    });   


    searchList.add({siteName: name, siteAddress: add})
    var searchResult = $( ".list li:last-of-type" );
    var hiddenResult = $( ".list li:last-of-type").children('div');
    hiddenResult.append(contentString)

    searchResult.click(function(self){
        infowindow.setContent(defaultContentString);
        infowindow.open(map, marker)

        $( ".list li" ).removeClass('hovered');
        $(this).toggleClass('hovered');

        $( ".list li" ).children('div').addClass('collapsed');
        hiddenResult.removeClass('collapsed');
    })

   google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(defaultContentString);
        infowindow.open(map,marker);

        $( ".list li" ).removeClass('hovered');
        searchResult.toggleClass('hovered');

        $( ".list li" ).children('div').addClass('collapsed');
        hiddenResult.removeClass('collapsed');

        $("#drawer").animate({
            scrollTop: searchResult.offset().top - $("#drawer").offset().top  + $("#drawer").scrollTop()
        })

    
    });

}

function init() {
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

    geocoder.geocode({'location': coordinates}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            $('#zipCode').val(results[0].formatted_address).parent().addClass('is-focused');
        } else {
            console.log("Geocode was not successful for the following reason: ")
        }
    });
}

$( document ).ready(function() {
    init()
});