// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
// Global variables
let canvas;
let gl;
let a_Position;
// NOTE: color variable that will be used to store the color of the shapes
var u_FragColor;
let u_Size;
// NOTE: this matrix is used to rotate and transalte cubes
let u_ModelMatrix;
// NOTE: used to rotate everything
let u_GlobalRotateMatrix;
var isMouseDown = false;
var g_globalAngle = -20;
var g_yellowAngle = 0;
var g_purpleAngle = 0;
var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var g_animationOn = false;
var elbowJointAngle = 0;
var leftArmJoint2Angle = 0;
var finJointAngle = 0;
var headAngle = 0;

// NOTE: addign thigns for the uv coordinates for the shader;
let a_UV;

// NOTE: will shiftClickanimtion

var hugAnimation = false;
var ShoulderLeftZAngle;
var ShoulderRightZAngle;

var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "attribute vec2 a_UV;\n" +
  "varying vec2 v_UV;\n" +
  "uniform mat4 u_ModelMatrix;\n" +
  "uniform mat4 u_GlobalRotateMatrix;\n" +
  "void main() {\n" +
  "gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n" +
  "v_UV = a_UV;\n" +
  "}\n";

// Fragment shader program

var FSHADER_SOURCE = "precision mediump float;\n" + 
"varying vec2 v_UV;\n"+
"uniform vec4 u_FragColor;\n" + // uniform変数
  "void main() {\n" +
  "gl_FragColor = u_FragColor;\n" +
  "gl_FragColor = vec4(v_UV,1.0,1.0);\n" +
  "}\n";

function setupWebGL() {
  canvas = document.getElementById("asg2");
  if (!canvas) {
    console.log("Failed to retrieve the <canvas> element");
    return;
  }

  // Rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}
function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }
  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) {
    console.log("Failed to get the storage location of a_UV");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }
  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }
  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix",
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }
  //
  //set the intial value of the matrix to be identiy
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  // Get
  //
  // Get the storage location of u_Size
}

function addActionsForHtmlUI() {
  document
    .getElementById("angleSlide")
    .addEventListener("mousemove", function () {
      g_globalAngle = this.value;
      renderScene();
    });
  document
    .getElementById("shoulderJoint")
    .addEventListener("mousemove", function () {
      elbowJointAngle = -this.value;
      // renderAllShapes();
      renderScene();
    });
  document
    .getElementById("elbowJoint")
    .addEventListener("mousemove", function () {
      leftArmJoint2Angle = this.value;
      // renderAllShapes();
      renderScene();
    });
  document
    .getElementById("finJoint")
    .addEventListener("mousemove", function () {
      finJointAngle = this.value;
      // renderAllShapes();
      renderScene();
    });
  document.getElementById("On").addEventListener("click", function () {
    g_animationOn = true;
    tick();
  });
  document.getElementById("Off").addEventListener("click", function () {
    g_animationOn = false;

    tick();
  });
  document.getElementById("asg2").addEventListener("click", function (event) {
    if (event.shiftKey) {
      hugAnimation = !hugAnimation;

      isMouseDown = !isMouseDown;
      tick();
    }
    if (event.button === 0) {
      // 0 indicates the left mouse button
      isMouseDown = !isMouseDown;
    }
  });
  document
    .getElementById("asg2")
    .addEventListener("mousemove", function (event) {
      if (isMouseDown) {
        g_globalAngle = event.pageX;
      }
    });
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // sets up the shadow programs and also the
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  tick();

  // gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Draw the rectangle
}

// this function is the function that will instiate to start the scene
function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  renderAllShapes();
}
// this function draws all the shaepes
//
//
//

function sendTextToHtml(text, htmlID) {
  let htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("no id found");
  } else {
    htmlElm.textContent = text;
  }
}
function renderAllShapes() {
  // NOTE: draws a new cube and scales and translates it color is red
  var body = new Cube();
  body.color = [0.05, 0.05, 0.05, 1.0];
  body.matrix.setTranslate(-0.25, -0.75, 0);

  body.matrix.rotate(-5, 0.1, 0, 0);
  // NOTE: starting posssition of head
  let headStartingPosition = new Matrix4(body.matrix);
  let saveTranslate = new Matrix4(body.matrix);
  let feetStartingPosition = new Matrix4(body.matrix);
  let feetStartingPosition2 = new Matrix4(body.matrix);
  let whiteBellyStartingPosition = new Matrix4(body.matrix);
  let leftShoulderStartingPosition = new Matrix4(body.matrix);
  let rightShoulderStartingPosition = new Matrix4(body.matrix);
  let bodyXandZ = 0.5;
  body.matrix.scale(bodyXandZ, bodyXandZ * 2, bodyXandZ);
  body.render();

  // let headstart = new Cube();
  // headstart.matrix = headStartingPosition;
  // headstart.matrix.translate(0.25, 1, 0.25);
  // let saveHeadStart = new Matrix4(headstart.matrix);
  // headstart.render();

  let head = new Cube();
  head.matrix = saveTranslate;
  head.color = [0.05, 0.05, 0.05, 1.0];
  let centerX = (0.5 - 0.42187) / 2;
  let centerZ = (0.5 - 0.3125) / 2;
  head.matrix.translate(centerX, 1, 0);

  head.matrix.rotate(headAngle, 1, 0, 0);
  // if (hugAnimation) {
  //   // head.matrix.translate(0, 0, 0.25);
  //   // head.matrix.translate(-centerX * 2, 0, 0);
  //   head.matrix.rotate(headAngle, 1, 0, 0);
  // }
  // this is how to rotate head by translating the center axis and then going back
  head.matrix.translate(0.25, 0, 0.25);
  head.matrix.rotate(15 * Math.sin(g_seconds), 0, 1, 0);
  head.matrix.translate(-0.25, 0, -0.25);

  let saveTranslate1 = new Matrix4(head.matrix);

  head.matrix.scale(0.42187, 0.6122, 0.3125);
  head.render();
  let eye = new Cube();
  eye.color = [0.8, 0.8, 0.8, 1.0];
  eye.matrix = saveTranslate1;
  centerZ = 0.3125 / 2;
  eye.matrix.translate(0.01, 0.3622, -0.03906);
  saveTranslate1 = new Matrix4(eye.matrix);
  eye.matrix.scale(0.082031, 0.074219, 0.03906);

  eye.render();

  eye2 = new Cube();
  eye2.color = [0.8, 0.8, 0.8, 1.0];
  eye2.matrix = saveTranslate1;
  eye2.matrix.translate(0.321, 0.0, 0.0);
  let noseStartingPosition = new Matrix4(eye2.matrix);

  eye2.matrix.scale(0.082031, 0.074219, 0.03906);
  eye2.render();

  nose = new Cube();
  nose.matrix = noseStartingPosition;
  nose.color = [0.960784, 0.654902, 0, 1.0];
  nose.matrix.rotate(-0, 0.1, 0, 0);
  // nose.matrix = saveTranslate1;
  // NOTE: you want to put the nose ahead of the head by adding head size + eye size
  nose.matrix.translate(-0.21, -0.18, -0.3125);

  nose.matrix.scale(0.203125, 0.105469, 0.464844);
  nose.render();

  // NOTE: Feet
  let feetYlength = 0.205469;

  let feet = new Cube();
  feet.color = [1, 0.596078, 0.070588, 1];
  feet.matrix = feetStartingPosition;
  feet.matrix.translate(-0.152735, 0, -0.25);
  feet.matrix.scale(0.303125, feetYlength, 0.264844);

  feet.render();
  let feet2 = new Cube();
  feet2.color = [1, 0.596078, 0.070588, 1];
  feet2.matrix = feetStartingPosition2;
  feet2.matrix.translate(0.352735, 0, -0.25);
  feet2.matrix.scale(0.303125, feetYlength, 0.264844);
  feet2.render();
  //end

  let whiteBelly = new Cube();
  whiteBelly.matrix = whiteBellyStartingPosition;
  let centerBelly = 0.05;
  whiteBelly.matrix.scale(bodyXandZ - centerBelly, bodyXandZ + 0.1, 0.03);
  whiteBelly.matrix.translate(centerBelly, 0.325469 + bodyXandZ / 2, -1);

  whiteBelly.color = [1, 1, 1, 1];
  whiteBelly.render();

  // NOTE: leftArm
  let leftShoulder = new Cube();
  let leftShoulderXaxisStart = 0.2;
  let leftShoulderZlength = 0.3;
  let leftShoulderYlength = 0.15;
  let leftShoulderYaxistStart = 4.2;
  leftShoulder.matrix = leftShoulderStartingPosition;
  leftShoulder.color = [0.0, 0.0, 0.0, 1.0];
  leftShoulder.matrix.rotate(-5, 0, 0, 1);

  leftShoulder.matrix.translate(
    -leftShoulderXaxisStart,
    0.9,
    (bodyXandZ - leftShoulderZlength) / 2,
  );
  if (hugAnimation && g_animationOn) {
    leftShoulder.matrix.rotate(ShoulderLeftZAngle, 1, 0, 0);
  }
  let leftArmJoint1StartingPos = new Matrix4(leftShoulder.matrix);

  leftShoulder.matrix.scale(
    leftShoulderXaxisStart,
    leftShoulderYlength,
    leftShoulderZlength,
  );
  leftShoulder.render();

  let leftArmJoint1 = new Cube();
  leftArmJoint1.color = [0, 0, 0, 1];
  let leftArmJoint1xLength = 0.1;
  let leftArmJoint1yLength = 0.4;
  let leftArmJoint1zLength = leftShoulderZlength - 0.05;
  leftArmJoint1.matrix = leftArmJoint1StartingPos;
  leftArmJoint1.matrix.rotate(elbowJointAngle, 0, 0, 1);
  leftArmJoint1.matrix.translate(
    -leftArmJoint1xLength + leftShoulderXaxisStart / 2 + 0.01,
    -leftArmJoint1yLength + leftShoulderYlength / 2 + 0.03,
    0.025,
  );

  let leftArmJoin2StartingPos = new Matrix4(leftArmJoint1.matrix);
  leftArmJoint1.matrix.scale(
    leftArmJoint1xLength,
    leftArmJoint1yLength,
    leftArmJoint1zLength - 0.01,
  );

  leftArmJoint1.render();

  let leftArmJoint2 = new Cube();
  leftArmJoint2.color = [0, 0, 0, 1];
  leftArmJoint2.matrix = leftArmJoin2StartingPos;
  leftArmJoint2.matrix.rotate(leftArmJoint2Angle, 0, 0);
  leftArmJoint2.matrix.translate(0.01, -0.14, 0.035);
  let leftArmJoint3Start = new Matrix4(leftArmJoint2.matrix);

  leftArmJoint2.matrix.scale(0.08, 0.2, 0.2);
  // leftArmJoint2.matrix.rotate(45 * Math.sin(2), 0, 0);

  leftArmJoint2.render();

  let leftArmJoint3 = new Cube();
  leftArmJoint3.color = [0, 0, 0, 1];
  leftArmJoint3.matrix = leftArmJoint3Start;
  leftArmJoint3.matrix.rotate(finJointAngle, 0, 0);
  leftArmJoint3.matrix.translate(0.01, -0.1, 0.055);
  leftArmJoint3.matrix.scale(0.06, 0.1, 0.13);
  leftArmJoint3.render();

  // NOTE: rightArm

  let rightShoulder = new Cube();
  let rightShoulderXaxisStart = 0.5;

  let rightShoulderxlength = 0.2;
  let rightShoulderZlength = 0.3;
  let rightShoulderYlength = 0.15;
  let rightShoulderYaxistStart = 4.2;
  rightShoulder.matrix = rightShoulderStartingPosition;
  rightShoulder.color = [0.0, 0.0, 0.0, 1.0];

  rightShoulder.matrix.rotate(5, 0, 0, 1);
  rightShoulder.matrix.translate(
    rightShoulderXaxisStart,
    0.85,
    (bodyXandZ - rightShoulderZlength) / 2,
  );
  if (hugAnimation && g_animationOn) {
    rightShoulder.matrix.rotate(ShoulderRightZAngle, 1, 0, 0, 0);
    rightShoulder.matrix.translate(0, -0.05 * Math.sin(g_seconds), 0);
  }
  // rightShoulder.matrix.translate(0, -0.05 * Math.sin(g_seconds), 0);

  // NOTE: add other animation arm animation two
  let rightArmJoint1StartingPos = new Matrix4(rightShoulder.matrix);
  rightShoulder.matrix.scale(
    rightShoulderxlength,
    rightShoulderYlength,
    rightShoulderZlength,
  );
  rightShoulder.render();

  let rightArmJoint1 = new Cube();
  rightArmJoint1.color = [0, 0, 0, 1];
  let rightArmJoint1xLength = 0.1;
  let rightArmJoint1yLength = 0.3;
  let rightArmJoint1zLength = rightShoulderZlength - 0.05;
  rightArmJoint1.matrix = rightArmJoint1StartingPos;
  rightArmJoint1.matrix.rotate(-elbowJointAngle, 0, 0, 1);
  rightArmJoint1.matrix.translate(
    -rightArmJoint1xLength +
      rightShoulderxlength / 2 -
      0.01 +
      rightShoulderxlength / 2,
    -rightArmJoint1yLength + rightShoulderYlength / 2 - 0.07,
    0.025,
  );

  let rightArmJoin2StartingPos = new Matrix4(rightArmJoint1.matrix);
  rightArmJoint1.matrix.scale(
    rightArmJoint1xLength,
    rightArmJoint1yLength,
    rightArmJoint1zLength - 0.01,
  );

  rightArmJoint1.render();

  let rightArmJoint2 = new Cube();
  rightArmJoint2.color = [0, 0, 0, 1];
  rightArmJoint2.matrix = rightArmJoin2StartingPos;
  rightArmJoint2.matrix.rotate(-leftArmJoint2Angle, 0, 0);
  rightArmJoint2.matrix.translate(0.01, -0.14, 0.035);
  let rightArmJoint3Start = new Matrix4(rightArmJoint2.matrix);

  rightArmJoint2.matrix.scale(0.08, 0.2, 0.2);
  // rightArmJoint2.matrix.rotate(45 * Math.sin(2), 0, 0);

  rightArmJoint2.render();

  let rightArmJoint3 = new Cube();
  rightArmJoint3.color = [0, 0, 0, 1];
  rightArmJoint3.matrix = rightArmJoint3Start;
  rightArmJoint3.matrix.rotate(-finJointAngle, 0, 0);
  rightArmJoint3.matrix.translate(0.01, -0.1, 0.055);
  rightArmJoint3.matrix.scale(0.06, 0.1, 0.13);
  rightArmJoint3.render();
}

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // console.log(g_seconds);

  var startTime = performance.now();
  updateAnimationAngle();

  renderScene();
  var duration = performance.now() - startTime;
  sendTextToHtml(
    " ms:" + Math.floor(duration) + " fps: " + Math.floor(10000 / duration),
    "fps",
  );

  requestAnimationFrame(tick);
}

function updateAnimationAngle() {
  if (g_animationOn) {
    elbowJointAngle = -32.5 * (1 + Math.sin(g_seconds));
    leftArmJoint2Angle = -12.5 * Math.sin(g_seconds);
    finJointAngle = -12.5 * Math.sin(g_seconds);
    headAngle = 12.5 * Math.sin(g_seconds);
  }
  if (hugAnimation && g_animationOn) {
    headAngle = 12.5 * Math.sin(g_seconds);
    ShoulderLeftZAngle = 40 * (1 - Math.sin(g_seconds));
    ShoulderRightZAngle = 55 * (1 - Math.sin(g_seconds));
    elbowJointAngle = elbowJointAngle + 25;
    leftArmJoint2Angle = leftArmJoint2Angle + 20;
    finJointAngle = finJointAngle + 20;
  }
}
