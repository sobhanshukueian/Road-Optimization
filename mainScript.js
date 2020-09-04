var x = require("./geom.js");
var x = require("./genetic-al.js");

var db = app.ActiveModelDb;
var doc = app.ActiveDocument();
var model = app.ActiveModel;
var dbWkt = model.CoordSysWkt;
// console.log("ooof", db.TableNames);
var bestReproject = app.GetBestFittingUTM84ProjectionWkt(
  model.Boundary.BBox2d,
  dbWkt
);
var styleConfig = {
  "Coverage/Grass With Gravel Border": "Polygon2",
  "Coverage/Restricted Area": "Polygon3",
};
var coverageIds = [];
var waterAreaIds = [];

var coverageCoords = [];
var waterAreaCoords = [];
var roadCoord = [];
var coverageTypes = [];

var roadIds = [];

function getGeometry(arr) {
  var data = {
    type: "LineString",
    coordinates: arr,
  };
  return data;
}

function getCoverageIDs() {
  var sset = app.ActiveSelectionSet;
  console.log("sset:", sset);

  if (sset.QueryCount(db.TableIndex("COVERAGES")) < 1) {
    print("Nothing Selected");
    return;
  }
  var filter = sset.GetFilter(db.TableIndex("COVERAGES"));
  var table = db.Table("COVERAGES");
  table.StartQuery(filter);
  var read;
  while ((read = table.Next())) {
    coverageIds.push(read.ID);
  }
  table.EndQuery();
}
function getWaterAreasIDs() {
  var sset = app.ActiveSelectionSet;
  console.log("sset:", sset);

  if (sset.QueryCount(db.TableIndex("WATER_AREAS")) < 1) {
    print("Nothing Selected");
    return;
  }
  var filter = sset.GetFilter(db.TableIndex("WATER_AREAS"));
  var table = db.Table("WATER_AREAS");
  table.StartQuery(filter);
  var read;
  while ((read = table.Next())) {
    waterAreaIds.push(read.ID);
  }
  console.log("water Areas:", waterAreaIds);
  table.EndQuery();
}
function getRoadIDs() {
  var sset = app.ActiveSelectionSet;
  console.log("sset:", sset);

  if (sset.QueryCount(db.TableIndex("ROADS")) < 1) {
    print("Nothing Selected");
    return;
  }
  var filter = sset.GetFilter(db.TableIndex("ROADS"));
  var table = db.Table("ROADS");
  table.StartQuery(filter);
  var read;
  while ((read = table.Next())) {
    roadIds.push(read.ID);
    id = read.ID;
  }
  table.EndQuery();
}
function createRoad(coordinates) {
  var tableR = db.Table("ROADS");
  //   for (var i in IDs) {
  var feature = tableR.GetWriteRow();

  var pos = getGeometry(coordinates);
  var geom = new adsk.Geometry(pos);

  feature.GEOMETRY = geom;

  feature.MANUAL_STYLE = "#ff0000";
  feature.DESCRIPTION = "Nadia";
  feature.GUID = app.createGuid();
  var featID = tableR.Insert(feature);
  if (featID > -1) {
    app.InvalidateTileCache(db.TableIndex("ROADS"), feature.GEOMETRY.BBox2d);
    console.log("invalidated");
  }
  tableR.EndQuery();
}

function getCoverageCoords() {
  console.log("coverages:", coverageIds);

  forEach(coverageIds, function (id) {
    var tableC = db.Table("COVERAGES");
    var coverage = tableC.QueryFeature(id);
    console.log("c", id, ":", coverage.RULE_STYLE, "__", coverage.MANUAL_STYLE);
    coverageTypes.push(styleConfig[coverage.MANUAL_STYLE]);
    var coords = JSON.parse(JSON.stringify(coverage.GEOMETRY.ToGeoJSON()))
      .coordinates;
    var eachCoverageCoords = [];
    forEach(coords[0], function (val) {
      eachCoverageCoords.push([val[0] * 10000000, val[1] * 10000000]);
    });
    coverageCoords.push(eachCoverageCoords);
    tableC.EndQuery();
  });
}

function getWaterAreaCoords() {
  console.log("waterAreas:", waterAreaIds);

  forEach(waterAreaIds, function (id) {
    var tableC = db.Table("WATER_AREAS");
    var waterArea = tableC.QueryFeature(id);
    var coords = JSON.parse(JSON.stringify(waterArea.GEOMETRY.ToGeoJSON()))
      .coordinates;
    var eachWaterAreaCoords = [];
    forEach(coords[0], function (val) {
      eachWaterAreaCoords.push([val[0] * 10000000, val[1] * 10000000]);
    });
    waterAreaCoords.push(eachWaterAreaCoords);
    tableC.EndQuery();
  });
}
function getRoadCoord() {
  console.log("road:", roadIds);

  var id = roadIds[0];
  console.log("selected road:", id);

  var tableR = db.Table("ROADS");
  var road = tableR.QueryFeature(id);
  var originRoadCoords = JSON.parse(JSON.stringify(road.GEOMETRY.ToGeoJSON()))
    .coordinates;
  forEach(originRoadCoords, function (val) {
    roadCoord.push([val[0] * 10000000, val[1] * 10000000]);
  });

  // console.log("coverage", id, ":", coords);
  tableR.EndQuery();
}
getRoadIDs();

getCoverageIDs();
getWaterAreasIDs();
getCoverageCoords();
getWaterAreaCoords();

getRoadCoord();
console.log("types:", coverageTypes);
configuration.coordinates = [roadCoord[0], roadCoord[roadCoord.length - 1]];
POLYGON = { type: [], coordinates: [] };
forEach(coverageCoords, function (val) {
  POLYGON.coordinates.push(val);
});
POLYGON.type = coverageTypes;
forEach(waterAreaCoords, function (val) {
  POLYGON.type.push("Polygon1");
  POLYGON.coordinates.push(val);
});
// var answer = run(roadCoord, coverageCoords);
// scenario2(answer);
// scenario1(answer);
// console.log(answer[2]);

var answer = start();
console.log("roadCoords:", roadCoord);
console.log(answer["maximum-cords"]);
console.log(Object.keys(answer));
var convertedBestCoordinates = JSON.parse(answer["maximum-cords"]);
var originBestCoordinates = [];
forEach(convertedBestCoordinates, function (val) {
  console.log("coords:", val[0], "__", val[0] / 10000000);
  originBestCoordinates.push([val[0] / 10000000.0, val[1] / 10000000.0]);
});
console.log("best Coordinates:", originBestCoordinates);
createRoad(originBestCoordinates);

gc();
