// initialize global variables and assign default values
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
let circle0;
let circle1;
let circle2;
let circle3;
let circles = [];

// create svg content
const areaDefinitionSvg = d3.select("#areaDefinitionSvg");
const area = areaDefinitionSvg.node();
const svgRect = area.getBoundingClientRect();

let g = areaDefinitionSvg.append("g");
let pattern = g.append("pattern");
let gridPath = pattern.append("path");
let borderPath = g.append("path");

// define function initialGrid to draw initial svg on clicking the button
function initialGrid() {
  // disable button
  document.getElementById("defineArea").disabled = true;
  // assign svg attributes
  pattern
    .attr("id", "grid")
    .attr("width", gridDensity)
    .attr("height", gridDensity)
    .attr("x", controlPoint0[0])
    .attr("y", controlPoint0[1])
    .attr("patternUnits", "userSpaceOnUse");

  gridPath
    .attr("d", `M ${gridDensity} 0 L 0 0 0 ${gridDensity}`)
    .attr("class", "gridInnerLines");

  borderPath
    .attr(
      "d",
      `M ${controlPoint0} L ${controlPoint1} L ${controlPoint2} L ${controlPoint3} Z`
    )
    .attr("id", "gridBorder");

  controlPoints.forEach(function (controlPoint, index) {
    g.append("circle")
      .attr("class", "controlCircle")
      .attr("id", `circle${index}`)
      .attr("cx", controlPoint[0])
      .attr("cy", controlPoint[1])
      .attr("r", pointRadius);
  });

  // assign control circles
  circle0 = d3.select("#circle0").node();
  circle1 = d3.select("#circle1").node();
  circle2 = d3.select("#circle2").node();
  circle3 = d3.select("#circle3").node();
  circles = [circle0, circle1, circle2, circle3];

  // create event listeners
  createEventListeners();
}

// define function to create event listeners when svg grid was created
function createEventListeners() {
  // add wheel event listener
  document.addEventListener("wheel", changeGridDensity);
  // add mousedown listener for whole grid to move
  let grid = document.getElementById("gridBorder");
  grid.addEventListener("mousedown", function (event) {
    grid.classList.add("grabbing");
    let mouseX = screenToSvgCoords(event).X;
    let mouseY = screenToSvgCoords(event).Y;
    pointCoordinates = {
      X: mouseX,
      Y: mouseY,
    };
    document.removeEventListener("wheel", changeGridDensity);
    document.addEventListener("mousemove", moveGrid);
    document.addEventListener("mouseup", mouseup);
  });
  // add event listener mousedown to circles
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
}

// define mousemove function
function mousemove(event) {
  setCurrentCoordinates(event);
  // if point coordinates and current coordinates distance is bigger then half of the grid cell -> update point coordinates
  let diffX = Math.abs(pointCoordinates.X - currentCoordinates.X);
  let diffY = Math.abs(pointCoordinates.Y - currentCoordinates.Y);

  if (diffX >= gridDensity / 2 || diffY >= gridDensity / 2) {
    pointCoordinates = {
      X:
        Math.round(
          (currentCoordinates.X - borderCoordinates.x1) / gridDensity
        ) *
          gridDensity +
        borderCoordinates.x1,
      Y:
        Math.round(
          (currentCoordinates.Y - borderCoordinates.y1) / gridDensity
        ) *
          gridDensity +
        borderCoordinates.y1,
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
  document.removeEventListener("mousemove", moveGrid);
  document.addEventListener("wheel", changeGridDensity);
  document.getElementById("gridBorder").classList.remove("grabbing");
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
  updateControlPoints();
  redrawGrid();
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

  pointCoordinates = {};
  activePointId = "";
}

function moveGrid(event) {
  setCurrentCoordinates(event);
  let diffX = pointCoordinates.X - currentCoordinates.X;
  let diffY = pointCoordinates.Y - currentCoordinates.Y;
  // update variables
  borderCoordinates.x1 -= diffX;
  borderCoordinates.x2 -= diffX;
  borderCoordinates.y1 -= diffY;
  borderCoordinates.y2 -= diffY;

  updateControlPoints();
  redrawGrid();

  pointCoordinates = currentCoordinates;
  document.addEventListener("mouseup", mouseup);
}

function updateControlPoints() {
  controlPoint0 = [borderCoordinates.x1, borderCoordinates.y1];
  controlPoint1 = [borderCoordinates.x2, borderCoordinates.y1];
  controlPoint2 = [borderCoordinates.x2, borderCoordinates.y2];
  controlPoint3 = [borderCoordinates.x1, borderCoordinates.y2];
  controlPoints = [controlPoint0, controlPoint1, controlPoint2, controlPoint3];
}

function redrawGrid() {
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

function setCurrentCoordinates(event) {
  let mouseX = screenToSvgCoords(event).X;
  let mouseY = screenToSvgCoords(event).Y;
  currentCoordinates = {
    X: mouseX,
    Y: mouseY,
  };
}
