// Create the layers for the background of the map
// Grayscale background.
var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=" +
  "pk.eyJ1IjoidHdpc3RlZGxleCIsImEiOiJjamswYWpyOXYwNHVzM2xtbHI3M2h6M2c5In0.UZ90d3wf078UZehRUVZ2nQ", {
    attribution: "Map data &copy;" +
      "<a href='http://openstreetmap.org'>OpenStreetMap</a> contributors," +
      "<a href='http://creativecommons.org/licenses/by-sa/2.0/'>" +
      "CC-BY-SA</a>" +
      "Imagery &copy;" +
      "<a href='http://mapbox.com'>Mapbox</a>",
    maxZoom: 18
  });

// Satellite background.
var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoidHdpc3RlZGxleCIsImEiOiJjamswYWpyOXYwNHVzM2xtbHI3M2h6M2c5In0.UZ90d3wf078UZehRUVZ2nQ", {
    attribution: "Map data &copy;" +
      "<a href='http://openstreetmap.org'>OpenStreetMap</a> contributors," +
      "<a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>" +
      "Imagery &copy; <a href='http://mapbox.com'>Mapbox</a>",
    maxZoom: 18
  });

// Outdoors background.
var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoidHdpc3RlZGxleCIsImEiOiJjamswYWpyOXYwNHVzM2xtbHI3M2h6M2c5In0.UZ90d3wf078UZehRUVZ2nQ", {
    attribution: "Map data &copy;" +
      "<a href='http://openstreetmap.org'>OpenStreetMap</a> contributors," +
      "<a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>" +
      "Imagery &copy; <a href='http://mapbox.com'>Mapbox</a>",
    maxZoom: 18
  });

// Create map object with layers
var map = L.map("mapid", {
  center: [
    40.7, -94.5
  ],
  zoom: 3,
  layers: [graymap, satellitemap, outdoorsmap]
});

// Add graymap
graymap.addTo(map);

// Create empty variables to add layer data
var tectonicdata = new L.LayerGroup();
var earthquakedata = new L.LayerGroup();

// Create container for selectable layers
var baseMaps = {
  Satellite: satellitemap,
  Grayscale: graymap,
  Outdoors: outdoorsmap
};

// Create container for each data overlay
var overlays = {
  "Tectonic Plates": tectonicdata,
  Earthquakes: earthquakedata
};

// Add layer selector
L
  .control
  .layers(baseMaps, overlays)
  .addTo(map);

// Retrieve Data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {

  // Calculate radius and color of earthquake markers based on magnitude
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  function getColor(magnitude) {
    switch (true) {
    case magnitude > 5:
      return "#ea2c2c";
    case magnitude > 4:
      return "#191970";
    case magnitude > 3:
      return "#008B8B";
    case magnitude > 2:
      return "#00CED1";
    case magnitude > 1:
      return "#7FFFD4";
    default:
      return "#D3D3D3";
    }
  }

  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // add data to a map layer
  L.geoJson(data, {
    
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Load info for each marker
    style: styleInfo,
    // Add popups
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
    // Add data to layer
  }).addTo(earthquakedata);

  // Add layer to map
  earthquakedata.addTo(map);

  // Add layer controls
  var legend = L.control({
    position: "bottomright"
  });

  // Add data for legend
  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#D3D3D3",
      "#7FFFD4",
      "#00CED1",
      "#008B8B",
      "#191970",
      "#ea2c2c"
    ];

    // Ceate legend label with colors
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add legend to map
  legend.addTo(map);

  // Get data
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
      // Add data to layer
      L.geoJson(platedata, {
        color: "tomato",
        weight: 2
      })
      .addTo(tectonicdata);

      // Add new layer to map
      tectonicdata.addTo(map);
    });
});
