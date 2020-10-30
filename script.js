let svgSelection = d3.select("#svgSelection");

// variables default values
let gridDensity = 10;

let borderCoordinates = {
  x1: 100,
  y1: 100,
  x2: 300,
  y2: 300,
};

const pointRadius = 4;

// 4 points from borderCoordinates
let point0 = [borderCoordinates.x1, borderCoordinates.y1];
let point1 = [borderCoordinates.x2, borderCoordinates.y1];
let point2 = [borderCoordinates.x2, borderCoordinates.y2];
let point3 = [borderCoordinates.x1, borderCoordinates.y2];

let controlPoints = [point0, point1, point2, point3];

//svg default content
let g = svgSelection.append("g");

let pattern = g
  .append("pattern")
  .attr("id", "grid")
  .attr("width", gridDensity)
  .attr("height", gridDensity)
  .attr("patternUnits", "userSpaceOnUse");

let gridPath = pattern
  .append("path")
  .attr("d", `M ${gridDensity} 0 L 0 0 0 ${gridDensity}`)
  .attr("class", "areaGridLines");

let borderPath = g
  .append("path")
  .attr("d", `M ${point0} L ${point1} L ${point2} L ${point3} Z`)
  .attr("class", "areaBorder");

controlPoints.forEach(function (point, index) {
  let areaPoint = g.append("circle");
  areaPoint
    .attr("class", "areaPoint")
    .attr("id", `point${index}`)
    .attr("cx", point[0])
    .attr("cy", point[1])
    .attr("r", pointRadius);
});

// select circles around points
let circle0 = d3.select("#point0").node();
let circle1 = d3.select("#point1").node();
let circle2 = d3.select("#point2").node();
let circle3 = d3.select("#point3").node();

let circles = [circle0, circle1, circle2, circle3];

circles.forEach(function (circle) {
  circle.addEventListener("mousedown", function () {
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  });
});

let mousemove = function (event) {
  let mouseX = event.clientX - 7;
  let mouseY = event.clientY - 7;
  //update border coordinates
  if (event.target.id === "point0") {
    borderCoordinates.x1 = mouseX;
    borderCoordinates.y1 = mouseY;
  } else if (event.target.id === "point1") {
    borderCoordinates.x2 = mouseX;
    borderCoordinates.y1 = mouseY;
  } else if (event.target.id === "point2") {
    borderCoordinates.x2 = mouseX;
    borderCoordinates.y2 = mouseY;
  } else {
    borderCoordinates.x1 = mouseX;
    borderCoordinates.y2 = mouseY;
  }

  //update point coordinates
  point0 = [borderCoordinates.x1, borderCoordinates.y1];
  point1 = [borderCoordinates.x2, borderCoordinates.y1];
  point2 = [borderCoordinates.x2, borderCoordinates.y2];
  point3 = [borderCoordinates.x1, borderCoordinates.y2];

  //redraw border
  borderPath.attr("d", `M ${point0} L ${point1} L ${point2} L ${point3} Z`);

  //redraw points
  circle0.setAttribute("cx", point0[0]);
  circle0.setAttribute("cy", point0[1]);

  circle1.setAttribute("cx", point1[0]);
  circle1.setAttribute("cy", point1[1]);

  circle2.setAttribute("cx", point2[0]);
  circle2.setAttribute("cy", point2[1]);

  circle3.setAttribute("cx", point3[0]);
  circle3.setAttribute("cy", point3[1]);

  document.addEventListener("mouseup", mouseup);
};

let mouseup = function (event) {
  document.removeEventListener("mousemove", mousemove);
  document.removeEventListener("mouseup", mouseup);
};
