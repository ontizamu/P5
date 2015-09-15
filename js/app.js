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
  this.name = ko.observable (data.name);
  this.address = ko.observable (data.address);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
  this.marker = ko.observable(data.marker)
};

function createInfoWindow(placeData,map){

  // Ask for info from FourSquare API and display it in the InfoWindow.

  // Look for the place ID

  var fsUrl = 'https://api.foursquare.com/v2/venues/search?near=Chandler,%20AZ&oauth_token=FIIGA1OLVC2SSSVTDTN43WU1XOXIKV0JAKE2H4CZMD2JPH0W&v=20150904&query=' + placeData.name + '';

  $.getJSON (fsUrl, function (data) {

    if (data.response.venues.length>0)
    {

      var placeId;
      placeID = data.response.venues[0].id;

      var detailurl = 'https://api.foursquare.com/v2/venues/' + placeID + '?oauth_token=FIIGA1OLVC2SSSVTDTN43WU1XOXIKV0JAKE2H4CZMD2JPH0W&v=20150904';
      var categories='';
      var contactPhone,description;

      // Get place info: categories and contact phone.

      $.getJSON(detailurl, function (data) {
      console.dir(data);

      if (data.response.venue.categories.length > 0 && data.response.venue.contact.formattedPhone){

        var categoriesLength=data.response.venue.categories.length;
        for (var i=0; i<categoriesLength-1; i++){
          categories = categories + data.response.venue.categories[i].name + ', ';
        }
        categories = categories + data.response.venue.categories[categoriesLength-1].name;
        contactPhone = data.response.venue.contact.formattedPhone;
        //description = data.response.venue.description;

        var contentstring = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h4 id="firstHeading" class="firstHeading">' + placeData.name + '</h4>'+
        '<div id="bodyContent">'+
        '<p>' + categories + '</p>'+
        '<p>' + placeData.address + ' ' + contactPhone + '</p>' +
        //'<p>' + description + '</p>' +
        '</div>'+
        '</div>';

        //  Create an infoWindow that displays more information about the location
          
        var infoWindow = new google.maps.InfoWindow({
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

         
/*
      // this is where the pin actually gets added to the map.
      // bounds.extend() takes in a map location object
      bounds.extend(new google.maps.LatLng(placeData.lat, placeData.lng));
      // fit the map to the new marker
      map.fitBounds(bounds);
      // center the map
      map.setCenter(bounds.getCenter());
    }

    // Sets the boundaries of the map based on pin locations
    window.mapBounds = new google.maps.LatLngBounds();
    

  }*/

var ViewModel = function () {
  
  // Check if google maps is working 

  if (typeof google === 'object' && typeof google.maps === 'object') {

    var self = this;

    // Observable array of places

    this.placeList = ko.observableArray([]);

    var map;

    var mapOptions = {
      center: new google.maps.LatLng(33.3000,-111.8333),
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // This line makes `map` a new Google Map JavaScript Object.
    map = new google.maps.Map(document.querySelector('#map'), mapOptions);

    //Initialize list and create map markers and info windows for each place.

    places.forEach(function(placeItem){
      placeItem.marker = new google.maps.Marker({
          map: map,
          position: {lat:placeItem.lat, lng:placeItem.lng},
          title: placeItem.name
      });
      placeItem.marker.setMap(map);
      google.maps.event.addListener(placeItem.marker, 'click', function() {
        createInfoWindow(placeItem,map);
        placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){ placeItem.marker.setAnimation(null); }, 2000); 
      });
      self.placeList.push(new Place(placeItem));
    });

    this.searchString = ko.observable('');

    //This computed variable filters list and map markers

    self.filter = ko.computed(function() {

      var inputValue = self.searchString();
  
      self.placeList.removeAll();

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

  // This function is called when the user clicks on a place on the list. It gets the FourSquare info 
  // that appears in the infoWindow, and open the infoWindow.

  this.activateMapMarker = function (clickedPlace){
    console.log ("Enter activateMapMarker");
    console.log (clickedPlace);

    var contentstring;

    var fsUrl = 'https://api.foursquare.com/v2/venues/search?near=Chandler,%20AZ&oauth_token=FIIGA1OLVC2SSSVTDTN43WU1XOXIKV0JAKE2H4CZMD2JPH0W&v=20150904&query=' + clickedPlace.name() + '';

    $.getJSON (fsUrl, function (data) {
      if (data.response.venues.length>0)
      {
        var placeId;
        placeID = data.response.venues[0].id;

        var detailurl = 'https://api.foursquare.com/v2/venues/' + placeID + '?oauth_token=FIIGA1OLVC2SSSVTDTN43WU1XOXIKV0JAKE2H4CZMD2JPH0W&v=20150904';
        var categories='';
        var contactPhone,description;

        $.getJSON(detailurl, function (data) {
        //console.dir(data);

          if (data.response.venue.categories.length > 0 && data.response.venue.contact.formattedPhone){

            var categoriesLength=data.response.venue.categories.length;
            for (var i=0; i<categoriesLength-1; i++){
              categories = categories + data.response.venue.categories[i].name + ', ';
            }
            categories = categories + data.response.venue.categories[categoriesLength-1].name;
            contactPhone = data.response.venue.contact.formattedPhone;
            description = data.response.venue.description;

            contentstring = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h4 id="firstHeading" class="firstHeading">' + clickedPlace.name() + '</h4>'+
            '<div id="bodyContent">'+
            '<p>' + categories + '</p>'+
            '<p>' + clickedPlace.address() + ' ' + contactPhone + '</p>' +
            //'<p>' + description + '</p>' +
            '</div>'+
            '</div>';

            //  Create an infoWindow that displays more information about the location
          
            var infoWindow = new google.maps.InfoWindow({
              content: contentstring
            });

            infoWindow.open(map,clickedPlace.marker());
          } else {
          alert(clickedPlace.name() + " info is not complete");
        }
        }).error(function(e){
       alert("Failed to get FourSquare info");
      });
      } else {
        alert("Place: " + clickedPlace.name() + " does not exist in FourSquare");
      }
    }).error(function(e){
        alert("Failed to get FourSquare info");
    });
    clickedPlace.marker().setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ clickedPlace.marker().setAnimation(null); }, 2000);
  }

  /*// Calls the initializeMap() function when the page loads
  window.addEventListener('load', initializeMap(self.placeList()));

  // Vanilla JS way to listen for resizing of the window
  // and adjust map bounds
  window.addEventListener('resize', function(e) {
  // Make sure the map bounds get updated on page resize
    map.fitBounds(mapBounds);
  });*/
};

ko.applyBindings(new ViewModel());

