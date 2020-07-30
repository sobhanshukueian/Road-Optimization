var x = require("./geom.js");
var db = app.ActiveModelDb;
var doc = app.ActiveDocument();
var model = app.ActiveModel;
var dbWkt = model.CoordSysWkt;
// console.log("ooof", db.TableNames);
var bestReproject = app.GetBestFittingUTM84ProjectionWkt(
  model.Boundary.BBox2d,
  dbWkt
);
var coverageIds = [];
var coverageCoords = [];
var roadCoord = [];

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
    console.log("coverage:", read.ID);
  }
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
    console.log("road:", read.ID);
    id = read.ID;
  }
  table.EndQuery();
}
function createRoad(coordinates) {
  var tableR = db.Table("ROADS");
  //   for (var i in IDs) {
  var feature = tableR.GetWriteRow();
  // console.log("nadia1", Object.keys(feature));
  // console.log("nadia2", Object.keys(tableR.QueryFeature(IDs[i])));

  // var road = tableR.QueryFeature(id);

  // console.log("this:", JSON.stringify(road.GEOMETRY.Is3d));
  // var coords = JSON.parse(JSON.stringify(road.GEOMETRY.ToGeoJSON()))
  //   .coordinates;
  // // console.log("ll",coords)
  // console.log("helloooo", JSON.stringify(road.GEOMETRY.ToGeoJSON()));

  // var coordinates = [
  //   coords[0],
  //   [coords[0][0], coords[coords.length - 1][1], coords[0][2]],
  //   coords[coords.length - 1],
  // ];
  // console.log("coordinates:", coordinates);
  // //   console.log("row ", i, ":", road.GEOMETRY.GeometryCount);
  // var wkt = "...";

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
  forEach(coverageIds, function (id) {
    var tableC = db.Table("COVERAGES");
    var coverage = tableC.QueryFeature(id);
    var coords = JSON.parse(JSON.stringify(coverage.GEOMETRY.ToGeoJSON()))
      .coordinates;
    coverageCoords.push(coords[0]);
    console.log("coverage", id, ":", coords);
    tableC.EndQuery();
  });
}
function getRoadCoord() {
  var id = roadIds[0];
  var tableR = db.Table("ROADS");
  var road = tableR.QueryFeature(id);
  roadCoord = JSON.parse(JSON.stringify(road.GEOMETRY.ToGeoJSON())).coordinates;

  // console.log("coverage", id, ":", coords);
  tableR.EndQuery();
}
getRoadIDs();

getCoverageIDs();
getCoverageCoords();
getRoadCoord();

var answer = run(roadCoord, coverageCoords);
scenario2(answer);
scenario1(answer);
console.log(answer[2]);

gc();
