// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
// Global variables
let canvas;
let gl;
let a_Position;
// NOTE: color variable that will be used to store the color of the shapes
let u_FragColor;
let u_Size;
// NOTE: this matrix is used to rotate and transalte cubes
let u_ModelMatrix;
// NOTE: used to rotate everything
let u_GlobalRotateMatrix;
let a_UV;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_purpleAngle = 0;
let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;
let g_yellowAnimation = false;
var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "attribute vec2 a_UV;\n" +
  "varying vec2 v_UV;\n" +
  "uniform mat4 u_ModelMatrix;\n" +
  "uniform mat4 u_GlobalRotateMatrix;\n" +
  "void main() {\n" +
  "  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n" +
  "v_UV = a_UV;\n" +
  "}\n";

// Fragment shader program

var FSHADER_SOURCE =
  "precision mediump float;\n" +
  "varying vec2 v_UV;\n" +
  "uniform vec4 u_FragColor;\n" + // uniform変数
  "void main() {\n" +
  "  gl_FragColor = u_FragColor;\n" +
  "  gl_FragColor = vec4(v_UV, 1.0, 1.0);\n" +
  "}\n";

// "  gl_FragColor = vec4(v_UV, 1.0, 1.0);\n" +
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

  // NOTE: had to comment out because it was unused to the u_FragColor is tossed out by the compiler

  // Get the storage location of u_FragColor
  // u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  // if (!u_FragColor) {
  //   console.log("Failed to get the storage location of u_FragColor");
  //   return;
  // }
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
      // renderAllShapes();
      renderScene();
    });
  document
    .getElementById("yellowSlide")
    .addEventListener("mousemove", function () {
      g_yellowAngle = this.value;
      // renderAllShapes();
      renderScene();
    });
  document
    .getElementById("purpleSlide")
    .addEventListener("mousemove", function () {
      g_purpleAngle = this.value;
      // renderAllShapes();
      renderScene();
    });
  document.getElementById("On").addEventListener("click", function () {
    g_yellowAnimation = true;
    tick();
  });
  document.getElementById("Off").addEventListener("click", function () {
    g_yellowAnimation = false;

    tick();
  });
}

function main() {
  // Set up canvas and gl variables
  setupWebGL();
  // sets up the shadow programs and also the
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // // // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // renderAllShapes();
  // renderScene();
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

function renderAllShapes() {
  // NOTE: draws a new cube and scales and translates it color is red
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.setTranslate(-0.25, -0.75, 0);
  body.matrix.rotate(-5, 1, 0, 0);
  body.matrix.scale(0.5, 0.3, 0.5);
  body.render();

  // //NOTE: yellow shape
  var leftArm = new Cube();
  leftArm.color = [1, 1, 0, 1];
  leftArm.matrix.setTranslate(0, -0.5, 0.0);
  leftArm.matrix.rotate(-5, 1, 0, 0);
  leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  // NOTE: stores a intermediate matrix so that our value is saved before we apply scale and translate
  // need to make new copy as javascript passes by pointer for complex objects
  var yellowCoordinates = new Matrix4(leftArm.matrix);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.matrix.translate(-0.5, 0, 0);
  leftArm.render();
  // // NOTE: purple part
  var box = new Cube();
  box.color = [1, 0, 1, 1];
  // sets the starting matrix to me where the yellow matrix is in posssition first
  // NOTE: you want to put it relative to the yellow coordinate system Links
  // 👀 important shows examples of how to put stuff into coordinate system in relative to other object
  // NOTE: also the it inherits the scales and and rotate in the coordinate sysem
  box.matrix = yellowCoordinates;
  box.matrix.translate(0, 0.65, 0);
  box.matrix.rotate(-g_purpleAngle, 0, 0, 1);
  box.matrix.scale(0.3, 0.3, 0.3);
  // z fighting make sure things aren't in the same spot exactly
  box.matrix.translate(-0.5, 0, -0.001);
  box.render();
}

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // console.log(g_seconds);

  updateAnimationAngle();

  renderScene();

  requestAnimationFrame(tick);
}

function updateAnimationAngle() {
  if (g_yellowAnimation) {
    g_yellowAngle = 45 * Math.sin(g_seconds);
  }
}
