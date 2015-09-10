var places = [
     {
        name:'Arrowhead Meadows Park',
        address:'1475 W Erie St Chandler, AZ'
      },
      {
        name:'Chandler Center for the Arts',
        address:'250 N Arizona Ave Chandler, AZ'
      },
      {
        name:'Chandler Public Library',
        address:'22 S Delaware St Chandler, AZ'
      },
      { 
        name:'Skateland',
        address:'1101 W Ray Rd Chandler, AZ'
      },
      {
        name:'Tumbleweed Park',
        address:'745 E Germann Rd Chandler, AZ'
      },
      {
        name:'Vision Gallery',
        address:'10 E Chicago St Chandler, AZ'
      },
      {
        name:'Xtreme Air Jump N Skate',
        address:'910 E Pecos Rd Chandler, AZ'
      }
];

var map; 

var Place = function (data) {
  this.name = ko.observable (data.name);
  this.address = ko.observable (data.address);
};

function initializeMap() {

    var mapOptions = {
      disableDefaultUI: true
    };

    // This next line makes `map` a new Google Map JavaScript Object.
    map = new google.maps.Map(document.querySelector('#map'), mapOptions);

    /*
    createMapMarker(placeData) reads Google Places search results to create map pins.
    placeData is the object returned from search results containing information
    about a single location.
    */
    function createMapMarker(placeData) {

      // The next lines save location data from the search result object to local variables
      var lat = placeData.geometry.location.lat();  // latitude from the place service
      var lon = placeData.geometry.location.lng();  // longitude from the place service
      var name = placeData.formatted_address;   // name of the place from the place service
      var bounds = window.mapBounds;            // current boundaries of the map window

      // Find the name of the place to display it in the map and the info window.

      var address = placeData.name + ' Chandler, AZ';

      for (var place in places) {
          if (places[place].address === address) {
              name = places[place].name;
          }
      }

      // marker is an object with additional data about the pin for a single location
      var marker = new google.maps.Marker({
        map: map,
        position: placeData.geometry.location,
        title: name
      });

      // Ask for info from FourSquare API and display it in the InfoWindow.

      var fsUrl = 'https://api.foursquare.com/v2/venues/search?near=Chandler,%20AZ&oauth_token=FIIGA1OLVC2SSSVTDTN43WU1XOXIKV0JAKE2H4CZMD2JPH0W&v=20150904&query=' + name + '';

 
      $.getJSON (fsUrl, function (data) {
        var placeId;
        placeID = data.response.venues[0].id;

        var detailurl = 'https://api.foursquare.com/v2/venues/' + placeID + '?oauth_token=FIIGA1OLVC2SSSVTDTN43WU1XOXIKV0JAKE2H4CZMD2JPH0W&v=20150904';
        var categories='';
        var contactPhone,description;

        $.getJSON(detailurl, function (data) {
          //console.dir(data);

          var categoriesLength=data.response.venue.categories.length;
          for (var i=0; i<categoriesLength-1; i++)
          {
            categories = categories + data.response.venue.categories[i].name + ', ';
          }
          categories = categories + data.response.venue.categories[categoriesLength-1].name;
          contactPhone = data.response.venue.contact.formattedPhone;
          description = data.response.venue.description;

          var contentstring = '<div id="content">'+
          '<div id="siteNotice">'+
          '</div>'+
          '<h2 id="firstHeading" class="firstHeading">' + name + '</h2>'+
          '<div id="bodyContent">'+
          '<p>' + categories + '</p>'+
          '<p>' + address + ' ' + contactPhone + '</p>' +
          //'<p>' + description + '</p>' +
          '</div>'+
          '</div>';

          //  Create an infoWindow that displays more information about the location
          
          var infoWindow = new google.maps.InfoWindow({
            content: contentstring
          });

          // when the user click on a marker, an infoWindow will open and the marker will bounce.

          google.maps.event.addListener(marker, 'click', function() {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){ marker.setAnimation(null); }, 2000); 
            infoWindow.open(map,marker);
          });
        });
      });

      // this is where the pin actually gets added to the map.
      // bounds.extend() takes in a map location object
      bounds.extend(new google.maps.LatLng(lat, lon));
      // fit the map to the new marker
      map.fitBounds(bounds);
      // center the map
      map.setCenter(bounds.getCenter());
    }

    /*
    callback(results, status) makes sure the search returned results for a location.
    If so, it creates a new map marker for that location.
    */
    function callback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMapMarker(results[0]);
      }
    }

    /*
    pinPoster(locations) takes in the array of locations
    and fires off Google place searches for each location
    */
    function pinPoster(locations) {

      // creates a Google place search service object. PlacesService does the work of
      // actually searching for location data.
      var service = new google.maps.places.PlacesService(map);

      // Iterates through the array of locations, creates a search object for each location
      for (var place in locations) {

        // the search request object
        var request = {
          query: locations[place].address
        };

        // Actually searches the Google Maps API for location data and runs the callback
        // function with the search results after each search.
        service.textSearch(request, callback);
      }
    }

    // Sets the boundaries of the map based on pin locations
    window.mapBounds = new google.maps.LatLngBounds();

    // pinPoster(locations) creates pins on the map for each location in
    // the locations array
    pinPoster(places);

  }

var ViewModel = function () {
  var self = this;

  // Observable array of places

  this.placeList = ko.observableArray([]);

  this.searchString = ko.observable('');

  self.filter = ko.computed(function() {

    var inputValue = self.searchString();
    console.log(inputValue);
  
    self.placeList.removeAll();

    places.forEach(function(placeItem,place){
      if (places[place].name.toLowerCase().indexOf(inputValue.toLowerCase())>=0) {
        self.placeList.push(new Place(placeItem));
      };
    });   
  
  }, this); 

  // Calls the initializeMap() function when the page loads
  window.addEventListener('load', initializeMap);

  // Vanilla JS way to listen for resizing of the window
  // and adjust map bounds
  window.addEventListener('resize', function(e) {
  // Make sure the map bounds get updated on page resize
    map.fitBounds(mapBounds);
  });
};

ko.applyBindings(new ViewModel());

