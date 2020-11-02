// initialize variables
const pointRadius = 6;

let gridDensity = 20;

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

let currentCoordinates = {};
let pointCoordinates = {};
let activePointId = "";

// create default svg with initial values
const areaDefinitionSvg = d3.select("#areaDefinitionSvg");
const area = areaDefinitionSvg.node();
const svgRect = area.getBoundingClientRect();

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

// add event listener mousedown to control circles
circles.forEach(function (circle) {
  circle.addEventListener("mousedown", function (event) {
    // make point coordinates equal to center of targeted event
    let pointX = event.target.getAttribute("cx");
    let pointY = event.target.getAttribute("cy");
    pointCoordinates = {
      X: pointX,
      Y: pointY,
    };

    activePointId = event.target.id;

    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  });
});

// define mousemove function
function mousemove(event) {
  let mouseX = screenToSvgCoords(event).X;
  let mouseY = screenToSvgCoords(event).Y;

  let currentCoordinates = {
    X: mouseX,
    Y: mouseY,
  };

  // if point coordinates and current coordinates distance is bigger then grid field (/half of it?) -> update point coordinates
  let diffX = Math.abs(pointCoordinates.X - currentCoordinates.X);
  let diffY = Math.abs(pointCoordinates.Y - currentCoordinates.Y);

  if (diffX >= gridDensity / 2 || diffY >= gridDensity / 2) {
    pointCoordinates = {
      X: Math.round(currentCoordinates.X / gridDensity) * gridDensity,
      Y: Math.round(currentCoordinates.Y / gridDensity) * gridDensity,
    };
    updateGrid(pointCoordinates.X, pointCoordinates.Y);
  }
}

// define mouseup function
function mouseup() {
  currentCoordinates = {};
  pointCoordinates = {};
  activePointId = "";
  document.removeEventListener("mousemove", mousemove);
  document.removeEventListener("mouseup", mouseup);
}

// define screenToSvgCoords function to translate coordinates from DOM to svg
function screenToSvgCoords(event) {
  let x = event.clientX - svgRect.x;
  let y = event.clientY - svgRect.y;
  return {
    X: x,
    Y: y,
  };
}

// define updateGrid function -> update variable values and redraw grid
function updateGrid(x, y) {
  // update border coordinates
  if (activePointId === "circle0") {
    borderCoordinates.x1 = x;
    borderCoordinates.y1 = y;
  } else if (activePointId === "circle1") {
    borderCoordinates.x2 = x;
    borderCoordinates.y1 = y;
  } else if (activePointId === "circle2") {
    borderCoordinates.x2 = x;
    borderCoordinates.y2 = y;
  } else if (activePointId === "circle3") {
    borderCoordinates.x1 = x;
    borderCoordinates.y2 = y;
  } else {
    console.log("Error: point not selected");
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
}
