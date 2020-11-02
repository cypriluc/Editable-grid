// initialize variables
const pointRadius = 4;

let gridDensity = 10;

let borderCoordinates = {
  x1: 100,
  y1: 100,
  x2: 300,
  y2: 300,
};

// define 4 border points from borderCoordinates
let controlPoint0 = [borderCoordinates.x1, borderCoordinates.y1];
let controlPoint1 = [borderCoordinates.x2, borderCoordinates.y1];
let controlPoint2 = [borderCoordinates.x2, borderCoordinates.y2];
let controlPoint3 = [borderCoordinates.x1, borderCoordinates.y2];

let controlPoints = [
  controlPoint0,
  controlPoint1,
  controlPoint2,
  controlPoint3,
];

// create default svg with initial values
let areaDefinitionSvg = d3.select("#areaDefinitionSvg");
let g = areaDefinitionSvg.append("g");

let pattern = g
  .append("pattern")
  .attr("id", "grid")
  .attr("width", gridDensity)
  .attr("height", gridDensity)
  .attr("patternUnits", "userSpaceOnUse");

let gridPath = pattern
  .append("path")
  .attr("d", `M ${gridDensity} 0 L 0 0 0 ${gridDensity}`)
  .attr("class", "gridInnerLines");

let borderPath = g
  .append("path")
  .attr(
    "d",
    `M ${controlPoint0} L ${controlPoint1} L ${controlPoint2} L ${controlPoint3} Z`
  )
  .attr("class", "gridBorder");

controlPoints.forEach(function (controlPoint, index) {
  g.append("circle")
    .attr("class", "controlCircle")
    .attr("id", `circle${index}`)
    .attr("cx", controlPoint[0])
    .attr("cy", controlPoint[1])
    .attr("r", pointRadius);
});

// select control circles
let circle0 = d3.select("#circle0").node();
let circle1 = d3.select("#circle1").node();
let circle2 = d3.select("#circle2").node();
let circle3 = d3.select("#circle3").node();

let circles = [circle0, circle1, circle2, circle3];

// add event listeners mousedown to control circles
circles.forEach(function (circle) {
  circle.addEventListener("mousedown", function (event) {
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  });
});

let mousemove = function (event) {
  document.removeEventListener("mouseup", mouseup);

  let mouseX = event.clientX;
  let mouseY = event.clientY;

  // update border coordinates
  if (event.target.id === "circle0") {
    borderCoordinates.x1 = mouseX;
    borderCoordinates.y1 = mouseY;
  } else if (event.target.id === "circle1") {
    borderCoordinates.x2 = mouseX;
    borderCoordinates.y1 = mouseY;
  } else if (event.target.id === "circle2") {
    borderCoordinates.x2 = mouseX;
    borderCoordinates.y2 = mouseY;
  } else if (event.target.id === "circle3") {
    borderCoordinates.x1 = mouseX;
    borderCoordinates.y2 = mouseY;
  } else {
    console.log("invalid event target: " + event.target.id);
  }

  // update control point coordinates
  controlPoint0 = [borderCoordinates.x1, borderCoordinates.y1];
  controlPoint1 = [borderCoordinates.x2, borderCoordinates.y1];
  controlPoint2 = [borderCoordinates.x2, borderCoordinates.y2];
  controlPoint3 = [borderCoordinates.x1, borderCoordinates.y2];

  controlPoints = [controlPoint0, controlPoint1, controlPoint2, controlPoint3];

  // redraw border
  borderPath.attr(
    "d",
    `M ${controlPoint0} L ${controlPoint1} L ${controlPoint2} L ${controlPoint3} Z`
  );

  // redraw points
  circles.forEach(function (circle, index) {
    circle.setAttribute("cx", controlPoints[index][0]);
    circle.setAttribute("cy", controlPoints[index][1]);
  });

  document.addEventListener("mouseup", mouseup);
};

let mouseup = function (event) {
  document.removeEventListener("mousemove", mousemove);
  document.removeEventListener("mouseup", mouseup);
};
