// ----- 1. Leaflet with Open Street Map from Mapbox ---

// Valkenswaard: 51.365556, 5.442447

// var mymap = L.map('mapid').setView([51.365556, 5.442447], 13);

//L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
//    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
//    maxZoom: 18,
//    id: 'mapbox.streets',
//    accessToken: 'pk.eyJ1Ijoicm9ia25hcGVuIiwiYSI6ImNpcXdlZ3FrcjAwMmFpMG5uaHcwZWd3YjMifQ.ok2WnvuXhf6SJPCkhr1pGQ'
//}).addTo(mymap);


// ----- 2. Leaflet with PDOK ---

var RD = new L.Proj.CRS.TMS(
    'EPSG:28992',
    '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs',
    [-285401.92,22598.08,595401.9199999999,903401.9199999999], {
    resolutions: [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420]
});

var map = new L.Map('map', {
  continuousWorld: true,
  crs: RD,
  layers: [
    new L.TileLayer('http://geodata.nationaalgeoregister.nl/tms/1.0.0/brtachtergrondkaart/{z}/{x}/{y}.png', {
        tms: true,
        minZoom: 3,
        maxZoom: 13,
        attribution: 'Kaartgegevens: © <a href="http://www.cbs.nl">CBS</a>, <a href="http://www.kadaster.nl">Kadaster</a>, <a href="http://openstreetmap.org">OpenStreetMap</a><span class="printhide">-auteurs (<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>).</span>',
        continuousWorld: true
    })
  ],
  center: new L.LatLng(51.365556, 5.442447),
  zoom: 8
});

// test RD coordinates
//map.on('click', function(e) {
//    if (window.console) {
//        var point = RD.projection.project(e.latlng);
//        console.log("RD X: " + point.x + ", Y: " + point.y);
//    }
//});


// BGT GeoJSON

//var bgtPandStyle = {
//    "color": "#ff7800",
//    "weight": 10,
//    "opacity": 0.65
//};

//var pandenGeojsonLayer = new L.GeoJSON.AJAX("data/bgt_pand.json", { style: bgtPandStyle } );
//pandenGeojsonLayer.addTo(map);
//
//var plannenGeojsonLayer = new L.GeoJSON.AJAX("data/bestemmingsplannen.json");
//plannenGeojsonLayer.addTo(map);


// Triply GeoJSON

// Graphs:
// BGT                  : http://lodlaundromat.org/data/a93e8d03e221da79dba13102ccfafd23"
// Monumenten           : http://lodlaundromat.org/data/c39e1092fd8387233e60222952f11a2a"
// Gemeentegeschiedenis : http://lodlaundromat.org/data/b0814d9ef0067418d2b829679a865f1a"

window.onload = function() {
    function onMapClick(e) {
        $.ajax({
          "accepts": {"json": "application/vnd.geo+json"},
          "data": {
            "graph": "http://lodlaundromat.org/data/c39e1092fd8387233e60222952f11a2a",
            "lng": e.latlng.lng,
            "lat": e.latlng.lat,
            "properties" : "yes",
            "page_size" : 30
          },
          "dataType": "json",
          "success": function(data) {
            var layer = L.geoJson(data.features, {
              "onEachFeature": function (feature, layer) {
                // This part populates the popup content with the info from GeoJSON.
                if (feature.properties) {
                  if (feature.properties['type']) {
                    layer.bindPopup('Type: ' + feature.properties['type']);
                  } else if (feature.properties.popupContent) {
                    layer.bindPopup(feature.properties.popupContent, {"maxWidth": 1000});
                  } else if (feature.properties['@id']) {
                    // No popup content.  Just show a ‘more info’ link.
                    var link = 'http://geonovum.triply.cc/graph?subject=' + encodeURIComponent(feature.properties['@id']);
                    layer.bindPopup('<a href="' + link + '" target="_self">Link to graph</a>');
                  }
                }
                // Avoid event bubbling that executes another map click.
                layer.on("click", function(levent) {
                  L.DomEvent.stopPropagation(levent);
                });
              },
              "style": function(feature) {
                if (feature.properties.color) {
                  return {
                    color: feature.properties.color,
                    fillColor: feature.properties.color
                  };
                }
              }
            }).addTo(map);

            // Animate markers a bit to distinguish them when zoomed out.
            layer.eachLayer(function(marker) {
              L.setOptions(marker, {riseOnHover: true});
            });
            map.fitBounds(layer.getBounds().pad(0.5), {animate:true});
          },
          "url": "http://geonovum.triply.cc/geo"
        });
    }
    map.on('click', onMapClick);
  };
