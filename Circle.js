class Circle {
  // construct new triangle object
  constructor() {
    this.type = "circle";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    this.segment = 15.0;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, size);

    // side/diameter length
    var d = this.size / 200.0;
    var r = d / 2;
    let vertices = [];
    // let verticies = [xy[0], xy[1]+r, xy[0]-r, xy[1]-r, xy[0]+r, xy[1]-r];

    let tp = this.segment;
    for (var i = 0; i <= tp; i++) {
      let angle = (2 * Math.PI * i) / tp;
      let x = xy[0] + r * Math.cos(angle);
      let y = xy[1] + r * Math.sin(angle);
      vertices.push(x, y);
    }

    drawCircle(tp, vertices);
  }
}

function drawCircle(sides, vertices) {
  var n = sides; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
}

//solutions uses gl.TRIANGLE_FAN instead drawing many trianles
//as this doesn't cause as man rendering issues
