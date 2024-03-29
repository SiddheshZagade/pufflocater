
var map;
var markers = [];
var infoWindow;
function initMap() {
    var losAngeles = {
        lat: 34.063380,
        lng: -118.358080
    }
	  var iconBase =
            'https://developers.google.com/maps/documentation/javascript/examples/full/images/';

    var icons = {
          parking: {
            icon: iconBase + 'parking_lot_maps.png'
          },
          library: {
            icon: iconBase + 'library_maps.png'
          },
          info: {
            icon: iconBase + 'info-i_maps.png'
          }
        };

    map = new google.maps.Map(document.getElementById('map'), {
        center: losAngeles,
        zoom: 8,
        
		styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
    });
    infoWindow = new google.maps.InfoWindow();
    searchStores();
    marker.addListener('click', toggleBounce);
    
}


function searchStores() {
  var foundStores = [];
  var zipCode = document.getElementById('zip-code-input').value;

  if (zipCode) {
      stores.forEach(function (store) {
          var storeZip = store.address.postalCode.substring(0, 5);
          var distance = calculateDistance(zipCode, storeZip);
          store.distance = distance; // Add distance property to store object
          foundStores.push(store);
      });

      // Sort the stores based on distance (ascending order)
      foundStores.sort(function (a, b) {
          return a.distance - b.distance;
      });

      // Take only the top 10 nearest stores
      foundStores = foundStores.slice(0, 10);
  } else {
      foundStores = stores;
  }

  clearLocations();
  displayStores(foundStores);
  showStoresMarkers(foundStores);
  getCurrentLocation();
  setOnClickListener();
}


// Function to calculate distance between two ZIP codes (you can replace this with a more accurate distance calculation)
function calculateDistance(zipCode1, zipCode2) {
  // For simplicity, you can use a placeholder calculation here.
  // In a real-world scenario, you may want to use a geocoding API to get the actual coordinates and calculate the distance.
  return Math.abs(parseInt(zipCode1) - parseInt(zipCode2));
}

function getCurrentLocation() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
          var userLatLng = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
          };

          // Add marker for user's current location
          var userMarker = new google.maps.Marker({
              position: userLatLng,
              map: map, // Assuming you have a reference to your Google Maps map object
              title: 'Your Location'
          });
      }, function (error) {
          console.error('Error getting user location:', error.message);
      });
  } else {
      console.error('Geolocation is not supported by this browser.');
  }
}

function clearLocations() {
    infoWindow.close();
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers.length = 0;
}


function setOnClickListener() {
    var storeElements = document.querySelectorAll('.store-container');
    storeElements.forEach(function(elem, index){
        elem.addEventListener('click', function(){
            google.maps.event.trigger(markers[index], 'click');
        })
    });
}

function displayStores(stores) {
    var storesHtml = "";
    stores.forEach(function(store, index){
        var address = store.addressLines;
        var phone = store.phoneNumber;
        storesHtml += `
            <div class="store-container">
                <div class="store-container-background">
                    <div class="store-info-container">
                        <div class="store-address">
                            <span>${address[0]}</span>
                            <span>${address[1]}</span>
                        </div>
                        <div class="store-phone-number">${phone}</div>
                    </div>
                    <div class="store-number-container">
                        <div class="store-number">
                            ${index+1}
                        </div>
                    </div>
                </div>
            </div>
        `
    });
    document.querySelector('.stores-list').innerHTML = storesHtml;
}


function showStoresMarkers(stores) {
    var bounds = new google.maps.LatLngBounds();
    stores.forEach(function(store, index){
        var latlng = new google.maps.LatLng(
            store.coordinates.latitude,
            store.coordinates.longitude);
        var name = store.name;
        var address = store.addressLines[0];
        var statusText = store.openStatusText;
        var phone = store.phoneNumber;
        bounds.extend(latlng);
        createMarker(latlng, name, address, statusText, phone, index);
    })
    map.fitBounds(bounds);
}


function createMarker(latlng, name, address, statusText, phone, index) {
    
  var html = `
        <div class="store-info-window">
            <div class="store-info-name">
                ${name}
            </div>
            <div class="store-info-status">
                ${statusText}
            </div>
            <div class="store-info-address">
                <div class="circle">
                    <i class="fas fa-location-arrow"></i>
                </div>
                ${address}
            </div>
            <div class="store-info-phone">
                <div class="circle">
                    <i class="fas fa-phone-alt"></i>
                </div>
                ${phone}
            </div>
        </div>
    `;
	   
    var marker = new google.maps.Marker({
      map: map,
      position: latlng,
      label: `${index+1}`,
      icon: {
        url: 'http://maps.google.com/mapfiles/kml/shapes/flag.png'
      },
      draggable:false,
      animation: google.maps.Animation.DROP
    });
    

  function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}
    google.maps.event.addListener(marker, 'click', function() {
      infoWindow.setContent(html);
      infoWindow.open(map, marker);
    });
    markers.push(marker);
}






