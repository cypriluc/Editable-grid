// initialize variables
const pointRadius = 6;

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
  .attr("x", controlPoint0[0])
  .attr("y", controlPoint0[1])
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

// add wheel event listener
document.addEventListener("wheel", changeGridDensity);

// add event listener mousedown to control circles
circles.forEach(function (circle) {
  circle.addEventListener("mousedown", function (event) {
    document.removeEventListener("wheel", changeGridDensity);
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
  document.addEventListener("wheel", changeGridDensity);
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

  //set grid origin
  pattern.attr("x", controlPoint0[0]).attr("y", controlPoint0[1]);

  // redraw points
  circles.forEach(function (circle, index) {
    circle.setAttribute("cx", controlPoints[index][0]);
    circle.setAttribute("cy", controlPoints[index][1]);
  });
}

// define change Grid density function listening to wheel event
function changeGridDensity(event) {
  // increase or decrease grid density by 5 px, set bottom and top limits
  if (event.deltaY < 0 && gridDensity > 5) {
    gridDensity -= 5;
  } else if (event.deltaY > 0 && gridDensity < 45) {
    gridDensity += 5;
  }
  //  redraw grid
  pattern
    .attr("width", gridDensity)
    .attr("height", gridDensity)
    .attr("x", borderCoordinates.x1)
    .attr("y", borderCoordinates.y1);
  gridPath.attr("d", `M ${gridDensity} 0 L 0 0 0 ${gridDensity}`);

  // adapt point2 coordinates to fit the grid
  activePointId = "circle2";
  let rx = (borderCoordinates.x2 - borderCoordinates.x1) % gridDensity;
  let ry = (borderCoordinates.y2 - borderCoordinates.y1) % gridDensity;
  if (rx < gridDensity / 2) {
    pointCoordinates.X = borderCoordinates.x2 - rx;
  } else {
    pointCoordinates.X = borderCoordinates.x2 - rx + gridDensity;
  }
  if (ry < gridDensity / 2) {
    pointCoordinates.Y = borderCoordinates.y2 - ry;
  } else {
    pointCoordinates.Y = borderCoordinates.y2 - ry + gridDensity;
  }

  updateGrid(pointCoordinates.X, pointCoordinates.Y);
}
