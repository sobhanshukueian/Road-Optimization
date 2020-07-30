POLYGON = {
  type: "Polygon",
  coordinates: [
    [
      [-100, 20],
      [-100, 60],
      [-80, 40],
      [-60, 60],
      [-40, 40],
      [-40, 20],
      [-100, 20],
    ],
    [
      [50, 10],
      [50, 20],
      [80, 20],
      [80, 10],
      [50, 10],
    ],
  ],
};

LINE = {
  type: "Line",
  coordinates: [
    [-110, 50],
    [-60, 50],
    [5, 5],
    [5, 30],
    [51, 12],
  ],
};

POLYLINE_WIDTH = 2;

var forEach = function (items, f) {
  var myI = 0;
  var myL = items.length;
  for (myI = 0; myI < myL; myI++) {
    f(items[myI]);
  }
};

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

    forEach(polygons, function (polygon) {
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
        for (var poly_cord = 0; poly_cord < polygon.length - 1; poly_cord++) {
          const element1 = polygon[poly_cord];
          dot_dist.push(
            LINEAR_SPACE.get_pDistance(
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
    forEach(polygons, function (polygon) {
      //calculate each polygon's area
      single_area = LINEAR_SPACE.get_polygon_area(polygon);
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
  //array for display the output
  display = [];
  //array of lines prperties
  properties = [];
  //array of Coordimates of line that is in the polygon or intersects it
  main_cords = [];

  //calculation on each line
  for (line = 0; line < lines.length - 1; line++) {
    //Lines coordinates
    line_cords = [lines[line], lines[line + 1]];
    cords = [];
    //seperate each polygon with "|"
    cords.push("|");

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
        )
      ) {
        cords.push(line_cords[0]);
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
        if (intersect[0]) {
          cords.push(intersect[1]);
          semi_cords.push(intersect[1]);
        }
      }

      //check if line's second coordinate is in the polygon or not
      if (
        LINEAR_SPACE.check_cord_in_polygon(
          polygon,
          line_cords[1][0],
          line_cords[1][1]
        )
      ) {
        cords.push(line_cords[1]);
        semi_cords.push(line_cords[1]);
      }

      //if line doesnt intersect polygon push the nn in the arrays
      if (semi_cords.length == 0) {
        cords.push("nn");
      }

      //seperate each polygon with "|"
      cords.push("|");
    }
    main_cords.push(cords);
    display.push([
      "line" + line,
      "Coordimates of line that is in the polygon or intersects it ==> " +
        cords,
    ]);

    //Calculate distance between coordinates in the polygon or intersects it from the cords array
    for (var cord = 0; cord < cords.length - 1; cord++) {
      var cord1 = cords[cord];
      var cord2 = cords[cord + 1];
      if (cord1 != "nn" && cord1 != "|") {
        //if coordinate be on the polygon it will copied in the array so we pass it
        if (cord1[0] == cord2[0] && cord1[1] == cord2[1]) {
          cord++;
          cord1 = cords[cord];
          cord2 = cords[cord + 1];
        }
        if (
          properties.length != 0 &&
          properties[properties.length - 1][0] == "line" + line
        ) {
          properties[
            properties.length - 1
          ][1] += LINEAR_SPACE.get_cords_distance(
            cord1[0],
            cord1[1],
            cord2[0],
            cord2[1]
          );
        } else {
          properties.push([
            "line" + line,
            LINEAR_SPACE.get_cords_distance(
              cord1[0],
              cord1[1],
              cord2[0],
              cord2[1]
            ),
          ]);
        }
        cord++;
      } else {
        //if properties length equals zero or line be separate from polygons add zero to our array
        if (
          properties.length == 0 ||
          (properties.length != 0 &&
            properties[properties.length - 1][0] != "line" + line)
        ) {
          properties.push(["line" + line, 0]);
        }
      }
    }
    display[line].push(
      "Line's Area in Polygons == >  " + properties[line][1] * POLYLINE_WIDTH
    );
    display[line].push(
      "Line Coordinates ==>  " + lines[line] + "  " + lines[line + 1]
    );
    display[line].push(
      "line distances from polygons ==> " +
        LINEAR_SPACE.get_nearest_polygon(
          [lines[line], lines[line + 1]],
          polygons
        )
    );
    properties[line].push(properties[line][1] * POLYLINE_WIDTH);
    properties[line].push([lines[line], lines[line + 1]]);
    properties[line].push(
      LINEAR_SPACE.get_nearest_polygon([lines[line], lines[line + 1]], polygons)
    );
  }
  //return three arrays => first, main_cords that shows ,coordimates of line that is in the polygon or intersects it,return
  // it if user needs, second ,properties of line that includes each line's properties in detail:
  // 1:line's index, 2:line's length in the polygons, 3:Line's area in polygons, 4:array of line's coordinates, 5:array of line's distances from polygons
  // and the third array is for displaying outputs
  return [main_cords, properties, display];
}
answer = run(LINE.coordinates, POLYGON.coordinates);

function senario2(answers) {
  for (var line = 0; line < answers[1].length; line++) {
    points = 0;
    const element = answers[1][line];
    if (element[2] == 0) {
      points += 12;
    } else {
      if (
        element[2] /
          LINEAR_SPACE.get_cords_distance(
            element[3][0][0],
            element[3][0][1],
            element[3][1][0],
            element[3][1][1]
          ) <
        0.05
      ) {
        points += 8;
      }
      if (
        element[2] /
          LINEAR_SPACE.get_cords_distance(
            element[3][0][0],
            element[3][0][1],
            element[3][1][0],
            element[3][1][1]
          ) <
        0.1
      ) {
        points += 2;
      }
    }
    answers[2][line].push("Line's point in senario 2 ==>  " + points);
    element.push(points);
  }
}

function senario1(answer) {
  for (var line = 0; line < answer[1].length; line++) {
    point = 0;
    const element = answer[1][line];
    if (element[2] == 0) {
      var res = true;
      for (var i = 0; i < element[4].length; i++) {
        res = res && element[4][i] === 45;
      }
      if (res) {
        point += 12;
      }

      six_point_flag = 0;
      sixteen_point_flag = 0;
      forEach(element[4], function (dis) {
        if (dis < 60) {
          sixteen_point_flag = 1;
        }
        if (dis < 30) {
          six_point_flag = 1;
        }
      });
      if (six_point_flag == 0) {
        point += 6;
      }
      if (sixteen_point_flag == 0) {
        point += 16;
      }
    } else {
      sum_area = 0;
      for (var r = 0; r < element[4].length - 1; r++) {
        if (element[4][r] == 15) {
          sum_area += TOTAL_AREA[0][r];
        }
      }
      if (sum_area / TOTAL_AREA[1] == 0.9) {
        point += 2;
      }
    }
    element.push(point);
    answer[2][line].push("Line's point in senario 1 ==>  " + point);
  }
}

// senario2(answer);
// senario1(answer);

// console.log(answer[2]);
