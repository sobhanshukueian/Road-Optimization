POLYGON = {
  type: ["Polygon2", "Polygon1", "Polygon3", "Polygon3", "Polygon2"],
  coordinates: [
    [
      [50, 20],
      [40, 30],
      [55, 50],
      [70, 30],
      [60, 20],
      [50, 20],
    ],
    [
      [10, 40],
      [0, 50],
      [10, 60],
      [30, 60],
      [40, 50],
      [30, 40],
      [10, 40],
    ],
    [
      [20, 10],
      [10, 20],
      [20, 30],
      [30, 20],
      [20, 10],
    ],
    [
      [-40, 10],
      [-40, 30],
      [0, 30],
      [0, 20],
      [-20, 10],
      [-40, 10],
    ],
    [
      [-40, 40],
      [-40, 60],
      [-60, 60],
      [-60, 40],
      [-40, 40],
    ],
  ],
};

// LINE = {
//     "type" : 'Line',
//     "coordinates" : [[-90,10],[-11,48],[1,36],[-86,48],[100,80]]
// }

POLYLINE_WIDTH = 2;

LINEAR_SPACE = {
  //Check if coordinate(x, y) is in the given polygon
  check_cord_in_polygon: function (polygon, x, y) {
    N = polygon.length - 1;
    flag = false;
    for (poly = 0; poly < N; poly++) {
      v1 = polygon[poly + 1];
      v2 = polygon[poly];
      if (
        v2[1] > y != v1[1] > y &&
        x < ((v1[0] - v2[0]) * (y - v2[1])) / (v1[1] - v2[1]) + v2[0]
      ) {
        flag = !flag;
      }
    }
    return flag;
  },

  // check if two lines intersect and get the intersect point in the second item of output array
  get_intersect_cords: function (x1, y1, x2, y2, x3, y3, x4, y4) {
    var ua,
      ub,
      denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    if (x1 == x2 && y1 == y2) {
      return [true, [x1, y1]];
    } else if (denom == 0) {
      return [false];
    } else {
      uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
      uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
      if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        return [true, [x1 + uA * (x2 - x1), y1 + uA * (y2 - y1)]];
      } else {
        return [false];
      }
    }
  },

  //Get two coordinates distance from eachother
  get_cords_distance: function (x1, y1, x2, y2) {
    var x_diff = x1 - x2;
    var y_diff = y1 - y2;

    return Math.sqrt(x_diff * x_diff + y_diff * y_diff);
  },

  //Get two lines distance from eachother
  get_pDistance: function (x, y, x1, y1, x2, y2) {
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) {
      param = dot / len_sq;
    }
    var xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  },

  //get distance of polygon's sides distance from a line and return the min
  get_nearest_polygon: function (line, polygons) {
    all_dis = [];
    polygons.forEach((polygon) => {
      f = 0;
      //check if line intersects polygon or not
      for (p = 0; p < polygon.length - 1; p++) {
        intersect = LINEAR_SPACE.get_intersect_cords(
          line[0][0],
          line[0][1],
          line[1][0],
          line[1][1],
          polygon[p][0],
          polygon[p][1],
          polygon[p + 1][0],
          polygon[p + 1][1]
        );
        if (intersect[0]) {
          f = 1;
        }
      }
      //if polygon and line separate from each other return the distance
      if (f == 0) {
        dot_dist = [];
        for (let poly_cord = 0; poly_cord < polygon.length - 1; poly_cord++) {
          const element1 = polygon[poly_cord];
          dot_dist.push(
            this.get_pDistance(
              element1[0],
              element1[1],
              line[0][0],
              line[0][1],
              line[1][0],
              line[1][1]
            )
          );
        }
      }
      //if they intersect return zero
      else {
        var dot_dist = [];
        dot_dist.push(0);
      }

      all_dis.push(Math.min.apply(Math, dot_dist));
    });
    return all_dis;
  },

  //Calculate one polygon's area
  get_polygon_area: function (polygon) {
    area = 0;
    j = polygon.length - 2;

    for (i = 0; i < polygon.length - 1; i++) {
      area =
        area +
        (polygon[j][0] + polygon[i][0]) * (polygon[j][1] - polygon[i][1]);
      j = i;
    }
    return Math.abs(area / 2);
  },

  //get the whole polygons area and return total in second item and in the first item return each polygon's area in an array
  get_total_area: function (polygons) {
    var total_area = 0;
    //array for each polygon's area
    const areas = [];
    polygons.forEach((polygon) => {
      //calculate each polygon's area
      single_area = this.get_polygon_area(polygon);
      total_area += single_area;
      areas.push(single_area);
    });
    return [areas, total_area];
  },
};

//get total area
TOTAL_AREA = LINEAR_SPACE.get_total_area(POLYGON.coordinates);

//Main function for calculating
function run(lines, polygons) {
  //object of lines prperties
  properties = {
    intersection: [],
    distances: [],
    lengthInPolygons: [],
    totalPolygonArea: TOTAL_AREA[1],
    polygonAreas: TOTAL_AREA[0],
    totalLength: 0,
  };
  //calculation on each line
  var total_length = 0;
  for (line = 0; line < lines.length - 1; line++) {
    total_length += LINEAR_SPACE.get_cords_distance(
      lines[line][0],
      lines[line][1],
      lines[line + 1][0],
      lines[line + 1][1]
    );
    //Lines coordinates
    line_cords = [lines[line], lines[line + 1]];
    cords = [];

    //calculation on each polygon
    for (j = 0; j < polygons.length; j++) {
      semi_cords = [];
      polygon = polygons[j];

      //check if line's first coordinate is in the polygon or not
      if (
        LINEAR_SPACE.check_cord_in_polygon(
          polygon,
          line_cords[0][0],
          line_cords[0][1]
        ) &&
        intersect[1] != line_cords[0] &&
        intersect[1] != line_cords[1]
      ) {
        semi_cords.push(line_cords[0]);
      }

      //check if line intersects the each edge of polygon or not
      for (p_cord = 0; p_cord < polygon.length - 1; p_cord++) {
        intersect = LINEAR_SPACE.get_intersect_cords(
          line_cords[0][0],
          line_cords[0][1],
          line_cords[1][0],
          line_cords[1][1],
          polygon[p_cord][0],
          polygon[p_cord][1],
          polygon[p_cord + 1][0],
          polygon[p_cord + 1][1]
        );
        if (
          intersect[0] &&
          intersect[1] != line_cords[0] &&
          intersect[1] != line_cords[1]
        ) {
          semi_cords.push(intersect[1]);
        }
      }

      //check if line's second coordinate is in the polygon or not
      if (
        LINEAR_SPACE.check_cord_in_polygon(
          polygon,
          line_cords[1][0],
          line_cords[1][1]
        ) &&
        intersect[1] != line_cords[0] &&
        intersect[1] != line_cords[1]
      ) {
        semi_cords.push(line_cords[1]);
      }

      //if line doesnt intersect polygon push the nn in the arrays
      if (semi_cords.length == 0) {
        semi_cords.push("nn");
      }
      cords.push(semi_cords);
    }
    properties.intersection[line] = cords.slice();
    // console.log(cords)

    length = [];
    //Calculate distance between coordinates in the polygon or intersects it from the cords array
    for (let cord = 0; cord < cords.length; cord++) {
      var c = cords[cord];
      //remove duplicate items fron array
      c = Array.from(new Set(c.map(JSON.stringify)), JSON.parse);
      if (c.length == 1) {
        length.push(0);
      } else {
        for (let p = 0; p < c.length - 1; p++) {
          h = 0;
          var incord1 = c[p];
          var incord2 = c[p + 1];
          h += LINEAR_SPACE.get_cords_distance(
            incord1[0],
            incord1[1],
            incord2[0],
            incord2[1]
          );
        }
        length.push(h);
      }
    }
    properties.lengthInPolygons[line] = length.slice();
    properties.distances[line] = LINEAR_SPACE.get_nearest_polygon(
      [lines[line], lines[line + 1]],
      polygons
    ).slice();
    properties.totalLength = total_length;
  }
  return properties;
}

// console.log(answer)

module.exports = {
  run,
  POLYGON,
};
