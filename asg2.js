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
let a_UV;
let g_yellowAngle = 0;
let g_purpleAngle = 0;
let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;
let g_yellowAnimation = false;

//NOTE: camera variables
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let g_globalAngle = 0;
let g_camera;

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() { 
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  v_UV = a_UV;
  }
`;

// Fragment shader program

var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
uniform int u_whichTexture;
  void main() {

  if(u_whichTexture == -4){
    gl_FragColor = vec4(1,.2,.2,1);
  }else if(u_whichTexture == -3) {
    gl_FragColor = vec4(v_UV, 1.0, 1.0); 
  }

else if(u_whichTexture == -2){
    gl_FragColor = texture2D(u_Sampler2, v_UV); 
  }
else if(u_whichTexture == -1){
    gl_FragColor = texture2D(u_Sampler1, v_UV); 
  }

else if(u_whichTexture == 0){
    gl_FragColor = texture2D(u_Sampler0, v_UV); 
  }
else if(u_whichTexture == 1){
gl_FragColor = u_FragColor;
  }
else{

gl_FragColor = u_FragColor;
}
}
`;
// NOTE: this code if for the using a live texuture:
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture = 1;
// uniform int u_whichTexture;
// precision mediump float;\n" +
// "varying vec2 v_UV;\n" +
// "uniform vec4 u_FragColor;\n" + // uniform
// "uniform sampler2D u_Sampler0;\n" + // uniform
// "uniform int u_whichTexture;\n"+
// "void main() {\n" +
// "  gl_FragColor = u_FragColor;\n" +
// "  gl_FragColor = vec4(v_UV, 1.0, 1.0);\n" +
// "  gl_FragColor = texture2D(u_Sampler0, v_UV);\n" +
// "}\n";
//
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
  u_Sampler0 = gl.getUniformLocation(gl.program, "u_Sampler0");
  if (!u_Sampler0) {
    console.log("Failed to get the storage location of u_Sampler0");
    return false;
  }
  u_Sampler1 = gl.getUniformLocation(gl.program, "u_Sampler1");
  if (!u_Sampler1) {
    console.log("Failed to get the storage location of u_Sampler1");
    return false;
  }
  u_Sampler2 = gl.getUniformLocation(gl.program, "u_Sampler2");
  if (!u_Sampler2) {
    console.log("Failed to get the storage location of u_Sampler2");
    return false;
  }
  u_whichTexture = gl.getUniformLocation(gl.program, "u_whichTexture");
  if (!u_whichTexture) {
    console.log("Failed to get the storage location of u_whichTexture");
    return false;
  }

  // NOTE: had to comment out because it was unused to the u_FragColor is tossed out by the compiler

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
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ViewMatrix) {
    console.log("Failed to get the storage location of u_ViewMatrix");
    return;
  }
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log("Failed to get the storage location of u_ProjectionMatrix");
    return;
  }
}

// NOTE: texture handling
function initTextures() {
  // Get the storage location of u_Sampler
  var image = new Image(); // Create the image object
  var image1 = new Image(); // Create the image object
  var image2 = new Image(); // Create the image object
  if (!image) {
    console.log("Failed to create the image object");
    return false;
  }
  if (!image1) {
    console.log("Failed to create the image object");
    return false;
  }
  if (!image2) {
    console.log("Failed to create the image object");
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function () {
    sendTextureToTEXTURE0(image);
  };
  image1.onload = function () {
    sendTextureToTEXTURE1(image1);
  };
  image2.onload = function () {
    sendTextureToTEXTURE2(image2);
  };
  // Tell the browser to load an image
  image.src = "sky.jpg";
  image1.src = "grass1.png";
  image2.src = "wall.jpg";

  // NOTE: texture needs to be a power of 2
  //can add more texturese later here
  return true;
}

function sendTextureToGLSL(image, sampler) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(sampler, 0);
  // gl.uniform1i(u_Sampler1, 0);
  // if (sampler == 0) {
  //   gl.uniform1i(u_Sampler0, 0);
  // } else if (sampler == 0) {
  //   gl.uniform1i(u_Sampler1, 0);
  // }
  console.log(sampler);

  // gl.clear(gl.COLOR_BUFFER_BIT); // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log("finished loadTexture");
}

function sendTextureToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  console.log("Finished loadTexture");
}
// ================================SKY
function sendTextureToTEXTURE1(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  console.log("Finished loadTexture1");
}

function sendTextureToTEXTURE2(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE2);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler2, 2);

  console.log("Finished loadTexture2");
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
  g_camera = new Camera();
  document.onkeydown = keydown;

  initTextures();
  // initTextures("dirt.jpg", u_Sampler0);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // // // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // renderAllShapes();
  // renderScene();
  // tick();
  requestAnimationFrame(tick);
  // gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Draw the rectangle
}

// this function is the function that will instiate to start the scene
function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
let g_eye = [0, 0, 3];
let g_at = [0, 0, -100];
var g_up = [0, 1, 0];

var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
];

function drawMap() {
  var body = new Cube();
  for (x = 0; x < g_map.length; x++) {
    for (y = 0; y < g_map[x].length; y++) {
      if (g_map[x][y] == 1) {
        body.color = [1.0, 0.0, 0.0, 1.0];
        body.matrix.setTranslate(x - 4, -0.75, y - 4);
        body.textureNum = -2;
        body.render();
      }
    }
  }
}

function drawPenguin() {
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

  let head = new Cube();
  head.matrix = saveTranslate;
  head.color = [0.05, 0.05, 0.05, 1.0];
  let centerX = (0.5 - 0.42187) / 2;
  let centerZ = (0.5 - 0.3125) / 2;
  head.matrix.translate(centerX, 1, 0);

  head.matrix.translate(0.25, 0, 0.25);

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
  // leftArmJoint1.matrix.rotate(elbowJointAngle, 0, 0, 1);
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
  // leftArmJoint2.matrix.rotate(leftArmJoint2Angle, 0, 0);
  leftArmJoint2.matrix.translate(0.01, -0.14, 0.035);
  let leftArmJoint3Start = new Matrix4(leftArmJoint2.matrix);

  leftArmJoint2.matrix.scale(0.08, 0.2, 0.2);
  // leftArmJoint2.matrix.rotate(45 * Math.sin(2), 0, 0);

  leftArmJoint2.render();

  let leftArmJoint3 = new Cube();
  leftArmJoint3.color = [0, 0, 0, 1];
  leftArmJoint3.matrix = leftArmJoint3Start;
  // leftArmJoint3.matrix.rotate(finJointAngle, 0, 0);
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
  // if (hugAnimation && g_animationOn) {
  //   rightShoulder.matrix.rotate(ShoulderRightZAngle, 1, 0, 0, 0);
  //   rightShoulder.matrix.translate(0, -0.05 * Math.sin(g_seconds), 0);
  // }
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
  // rightArmJoint1.matrix.rotate(-elbowJointAngle, 0, 0, 1);
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
  // rightArmJoint2.matrix.rotate(-leftArmJoint2Angle, 0, 0);
  rightArmJoint2.matrix.translate(0.01, -0.14, 0.035);
  let rightArmJoint3Start = new Matrix4(rightArmJoint2.matrix);

  rightArmJoint2.matrix.scale(0.08, 0.2, 0.2);
  // rightArmJoint2.matrix.rotate(45 * Math.sin(2), 0, 0);

  rightArmJoint2.render();

  let rightArmJoint3 = new Cube();
  rightArmJoint3.color = [0, 0, 0, 1];
  rightArmJoint3.matrix = rightArmJoint3Start;
  // rightArmJoint3.matrix.rotate(-finJointAngle, 0, 0);
  rightArmJoint3.matrix.translate(0.01, -0.1, 0.055);
  rightArmJoint3.matrix.scale(0.06, 0.1, 0.13);
  rightArmJoint3.render();
}

function renderAllShapes() {
  // var projMat = new Matrix4();
  // projMat.setPerspective(50, canvas.width / canvas.height, 0.1, 100);
  // gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  var projMat = g_camera.projMat;
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // var viewMat = new Matrix4();
  // viewMat.setLookAt(
  //   g_eye[0],
  //   g_eye[1],
  //   g_eye[2],
  //   g_at[0],
  //   g_at[1],
  //   g_at[2],
  //   g_up[0],
  //   g_up[1],
  //   g_up[2],
  // );
  // viewMat.setLookAt(0, 0, 3, 0, 0, -100);
  // gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
  //
  //

  // Pass the view matrix
  var viewMat = g_camera.viewMat;
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // NOTE: draws a new cube and scales and translates it color is red

  // var body = new Cube();
  // body.textureNum = 0;
  // body.color = [1.0, 0.0, 0.0, 1.0];
  // body.matrix.setTranslate(-0.25, -0.75, 0);
  // body.matrix.rotate(-5, 1, 0, 0);
  // body.matrix.scale(0.5, 0.3, 0.5);
  // body.textureNum = 1;
  // body.render();

  // //NOTE: yellow shape
  // var leftArm = new Cube();
  // leftArm.color = [1, 1, 0, 1];
  // leftArm.matrix.setTranslate(0, -0.5, 0.0);
  // leftArm.matrix.rotate(-5, 1, 0, 0);
  // leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  // // NOTE: stores a intermediate matrix so that our value is saved before we apply scale and translate
  // // need to make new copy as javascript passes by pointer for complex objects
  // var yellowCoordinates = new Matrix4(leftArm.matrix);
  // leftArm.matrix.scale(0.25, 0.7, 0.5);
  // leftArm.matrix.translate(-0.5, 0, 0);
  // leftArm.textureNum = 1;
  // leftArm.render();
  // // // NOTE: purple part
  // var box = new Cube();
  // box.color = [1, 0, 1, 1];
  // // sets the starting matrix to me where the yellow matrix is in posssition first
  // // NOTE: you want to put it relative to the yellow coordinate system Links
  // // 👀 important shows examples of how to put stuff into coordinate system in relative to other object
  // // NOTE: also the it inherits the scales and and rotate in the coordinate sysem
  // box.matrix = yellowCoordinates;
  // box.matrix.translate(0, 0.65, 0);
  // box.matrix.rotate(-g_purpleAngle, 0, 0, 1);
  // box.matrix.scale(0.3, 0.3, 0.3);
  // // z fighting make sure things aren't in the same spot exactly
  // box.matrix.translate(-0.5, 0, -0.001);
  // box.textureNum = 1;
  // box.render();

  drawPenguin();
  var floor = new Cube();
  floor.color = [1.0, 0.0, 0.0, 1.0];
  floor.textureNum = -1;
  floor.matrix.translate(0, -0.75, 0.0);
  floor.matrix.scale(10, 0, 10);
  floor.matrix.translate(-0.5, 0, -0.5);
  floor.render();

  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum = 0;
  sky.matrix.scale(50, 50, 50);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  sky.render();

  drawMap();
}

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;
  // console.log(g_seconds);

  updateAnimationAngle();

  // renderScene();
  renderAllShapes();

  requestAnimationFrame(tick);
}

function updateAnimationAngle() {
  if (g_yellowAnimation) {
    g_yellowAngle = 45 * Math.sin(g_seconds);
  }
}

function keydown(ev) {
  if (ev.keyCode == 39 || ev.keyCode == 68) {
    // Right Arrow or D
    g_camera.right();
    g_eye[0] += 0.2;
  } else if (ev.keyCode == 37 || ev.keyCode == 65) {
    // Left Arrow or A
    g_camera.left();
    g_eye[0] -= 0.2;
  } else if (ev.keyCode == 38 || ev.keyCode == 87) {
    // up Arrow or W
    g_camera.forward();
  } else if (ev.keyCode == 40 || ev.keyCode == 83) {
    // down Arrow or S
    g_camera.back();
  } else if (ev.keyCode == 81) {
    // Q
    g_camera.panLeft();
  } else if (ev.keyCode == 69) {
    // E
    g_camera.panRight();
  }
  console.log(ev.keyCode);
  // renderAllShapes();
}
