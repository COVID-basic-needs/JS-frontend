var infowindow = new google.maps.InfoWindow();
var latlng = new google.maps.LatLng(40.413993, -99.034504);

var map = new google.maps.Map(document.getElementById("map"), {
  zoom: 4,
  center: latlng,
  mapTypeId: google.maps.MapTypeId.ROADMAP
});

var geocoder = new google.maps.Geocoder();

const client = algoliasearch('JWHPBFC4T1', '6eb371014c3bff23b98dde01a8ef1763');
const index = client.initIndex('prod_schools');  

var listTemplate = `<li>
    <a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1 siteName"></h5>
            <small></small>
            <span class="glyphicon glyphicon-chevron-down"></span>
        </div>
        <p class="mb-1 collapsed"></p>
    <small></small>
</a></li>
`



var searchOptions = {
    valueNames: [ 'siteName', 'siteAddress' ],
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
            map.setZoom(10);
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
    map.setZoom(10);
    findResults(position.coords.latitude, position.coords.longitude);

    geocoder.geocode({'location': coordinates}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            $('#zipCode').val(results[0].formatted_address).parent().addClass('is-dirty');
        } else {
            console.log("Geocode was not successful for the following reason: ")
        }
    });
}

$( document ).ready(function() {
    init()
});


$('body')
  .on('mousedown', '.popover', function(e) {
    e.preventDefault()
});


var about = `<p>Darcie is an automated phone line anyone can call to find human services near them, such as free food, legal assistance, non-emergency medical help, and more. Read more and watch a live stream of the conversations at <a href="http://www.darcie.me">darcie.me</a> <br/> <b>COVID-19 Update</b> Darcie was intended to pull from all services listed in the <a href="https://sfserviceguide.org/">SF Service Guide</a>, however in the current times the format of the data in that database (a.k.a. <a href="https://github.com/sheltertechsf/askdarcel-api">AskDarcel on github</a>) made it hard to keep the information up to date with service hours & offerings changing. We pivoted Darcie to pull from a seperate Algolia index which consists of all hygiene stations & places handing out food in SF. The dialog & webhook have been adopted accordingly.</p>`
$('#about').popover({
    content: about,
    trigger: 'focus'

})

var contactInfo = `<p>Contributing, Branching, & Forking
While we actively accept help, as well as encourage you to fork this repo and build it out for your city, we do not take pull requests directly to this repo - please contact us before you plan to do so. Reach out to: </br>
<a href = "https://github.com/ShelterTechSF/VACS-MVP">Github</a> 
 Twitter <a href="https://twitter.com/dariceshelter">@dariceshelter</a></p>`

$('#contact').popover({
    content: contactInfo,
    trigger: 'focus'

})


