Markers = new Mongo.Collection('markers');

if (Meteor.isClient) {

  Template.map.onCreated(function() {
    var sidebar = $('.menu.sidebar.gottago');

    sidebar
      .sidebar('setting', 'dimPage', 'false');

    GoogleMaps.ready('map', function(map) {

      if (navigator.geolocation) {
           navigator.geolocation.getCurrentPosition(function (position) {
               initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
               map.instance.setCenter(initialLocation);
           });
       }

        google.maps.event.addListener(map.instance, 'click', function(event) {
          Markers.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        });

        var showPosition = function (position) {
          map.instance.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude), 16);
        }

      navigator.geolocation.getCurrentPosition(showPosition);

      var markers = {};

      Markers.find().observe({
        added: function (document) {
          var marker = new google.maps.Marker({
            draggable: true,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(document.lat, document.lng),
            map: map.instance,
            id: document._id
          });

          google.maps.event.addListener(marker, 'dragend', function(event) {
            Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
          });

          markers[document._id] = marker;
        },
        changed: function (newDocument, oldDocument) {
          markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
        },
        removed: function (oldDocument) {
          markers[oldDocument._id].setMap(null);
          google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
          delete markers[oldDocument._id];
        }
      });
    });
  });

  Meteor.startup(function() {
    GoogleMaps.load();
  });

  Template.map.helpers({
    mapOptions: function() {
      if (GoogleMaps.loaded()) {
        return {
          center: new google.maps.LatLng(-37.8136, 144.9631),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
      }
    }
  });

  Template.topbar.events({
    'click #show-sidebar': function (event, template) {
      $('.menu.sidebar.gottago')
        .sidebar('setting', 'dimPage', false)
        .sidebar('setting', 'closable', false)
        .sidebar('toggle');
    }
  });
}