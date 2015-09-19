// Array with all the places that will appear in the list and the map
var places = [
  {
    name:'Arrowhead Meadows Park',
    address:'1475 W Erie St Chandler, AZ',
    lat: 33.308411,
    lng: -111.866398,
    marker: ''
  },
  {
    name:'Chandler Center for the Arts',
    address:'250 N Arizona Ave Chandler, AZ',
    lat: 33.3073872,
    lng: -111.8424549,
    marker: ''
  },
  {
    name:'Chandler Public Library',
    address:'22 S Delaware St Chandler, AZ',
    lat: 33.3033887,
    lng: -111.83803920000003,
    marker: ''
  },
  { 
    name:'Skateland',
    address:'1101 W Ray Rd Chandler, AZ',
    lat: 33.3198703,
    lng: -111.86147189999997,
    marker: ''
  },
  {
    name:'Tumbleweed Park',
    address:'745 E Germann Rd Chandler, AZ',
    lat: 33.276005,
    lng: -111.82938039999999,
    marker: ''
  },
  {
    name:'Vision Gallery',
    address:'10 E Chicago St Chandler, AZ',
    lat: 33.3006309,
    lng: -111.84133159999999,
    marker: ''
  },
  {
    name:'Xtreme Air Jump N Skate',
    address:'910 E Pecos Rd Chandler, AZ',
    lat: 33.2930177,
    lng: -111.82698779999998,
    marker: ''
  }
];


var Place = function (data) {
  this.name = ko.observable(data.name);
  this.address = ko.observable(data.address);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
  this.marker = ko.observable(data.marker);
};

var infoWindow;

function createInfoWindow(placeData,map){

  // Ask for info from FourSquare API and display it in the InfoWindow.

  // Look for the place ID

  var fsUrl = 'https://api.foursquare.com/v2/venues/search?near=Chandler,%20AZ&oauth_token=FIIGA1OLVC2SSSVTDTN43WU1XOXIKV0JAKE2H4CZMD2JPH0W&v=20150904&query=' + placeData.name + '';

  $.getJSON (fsUrl, function (data) {

    if (data.response.venues.length>0) {

      var placeID = data.response.venues[0].id;

      var detailurl = 'https://api.foursquare.com/v2/venues/' + placeID + '?oauth_token=FIIGA1OLVC2SSSVTDTN43WU1XOXIKV0JAKE2H4CZMD2JPH0W&v=20150904';
      var categories='';
      var contactPhone,description;

      // Get place info: categories and contact phone.

      $.getJSON(detailurl, function (data) {

      if (data.response.venue.categories.length > 0 && data.response.venue.contact.formattedPhone){

        var categoriesLength=data.response.venue.categories.length;
        for (var i=0; i<categoriesLength-1; i++){
          categories = categories + data.response.venue.categories[i].name + ', ';
        }
        categories = categories + data.response.venue.categories[categoriesLength-1].name;
        contactPhone = data.response.venue.contact.formattedPhone;

        var contentstring = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h4 id="firstHeading" class="firstHeading">' + placeData.name + '</h4>'+
        '<div id="bodyContent">'+
        '<p>' + categories + '</p>'+
        '<p>' + placeData.address + ' ' + contactPhone + '</p>' +
        '</div>'+
        '</div>';

        // Is there currently an open infoWindow?
        if (infoWindow !== undefined) {
          infoWindow.close();
        }

        //  Create an infoWindow that displays more information about the location
          
        infoWindow = new google.maps.InfoWindow({
          content: contentstring
        });

        // when the user clicks on a marker, the infoWindow is opened and the marker bounces.

        infoWindow.open(map,placeData.marker);
      } else {
        alert(placeData.name + " info is not complete");
      }
      }).error(function(e){
      alert("Failed to get FourSquare info");
    });
    } else {
      alert("Place: " + placeData.name + " does not exist in FourSquare");
    }
  }).error(function(e){
      alert("Failed to get FourSquare info");
  });
}

         
var ViewModel = function () {
  
  // Check if google maps is working
  // Found the way to do it at http://stackoverflow.com/questions/9228958/how-to-check-if-google-maps-api-is-loaded

  if (typeof google === 'object' && typeof google.maps === 'object') {

    var self = this;

    // Observable array of places

    this.placeList = ko.observableArray([]);

    var map;

    var mapOptions = {
      disableDefaultUI: true
    };

    // This line makes `map` a new Google Map JavaScript Object.
    map = new google.maps.Map(document.querySelector('#map'), mapOptions);

    //Set the boundaries of the map.
    var bounds = new google.maps.LatLngBounds();

    //Initialize list and create map markers and info windows for each place.

    places.forEach(function(placeItem){
      placeItem.marker = new google.maps.Marker({
          map: map,
          position: {lat:placeItem.lat, lng:placeItem.lng},
          title: placeItem.name
      });
      // map marker gets added to the map;
      bounds.extend(new google.maps.LatLng(placeItem.lat, placeItem.lng));
      // fit the map to the new marker
      map.fitBounds(bounds);
      // center the map
      map.setCenter(bounds.getCenter());
      // if the user clicks a map marker, an info window is opened and the map marker bounces. 
      google.maps.event.addListener(placeItem.marker, 'click', function() {
        createInfoWindow(placeItem,map);
        placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){ placeItem.marker.setAnimation(null); }, 2000); 
      });
      self.placeList.push(new Place(placeItem));
    });

    this.searchString = ko.observable('');

    //This computed variable filters list and map markers. 
    // This was a hard one, I found how to do it at Udacity forums.

    self.filter = ko.computed(function() {

      var inputValue = self.searchString();
  
      self.placeList.removeAll();

      // This loop shows the list items and map markers that match the search string, if there is no
      // search string, all list items and map markers are showed.
      places.forEach(function(placeItem,place){
        if (places[place].name.toLowerCase().indexOf(inputValue.toLowerCase())>=0) {
          places[place].marker.setVisible(true);
          self.placeList.push(new Place(placeItem));        
        } else {
          places[place].marker.setVisible(false);
        }
      });   
    }, this);
  } else {
      alert("The map cannot be loaded");
  }

  // This function is called when the user clicks on a place on the list. 
  // It triggers a click on the clickedPlace's map marker, calling the CreateInfoWindow function.

  this.activateMapMarker = function (clickedPlace){

    google.maps.event.trigger(clickedPlace.marker(), 'click');
  
  };
};

ko.applyBindings(new ViewModel());

