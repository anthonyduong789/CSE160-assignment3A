class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }
  render() {
    var rgba = this.color;

    // Pass the color of a point to a u_FragColor uniform variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // NOTE: pass the matrix to u_ModelMatrix attribute
    // gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    //
    // // Front of the cube two triangles that will make up the front of the cube
    // drawTriangle3D([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]);
    // drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0]);
    //
    // //NOTE: what this seentially does is change the lighting of the cube to give it a 3d effect
    // gl.uniform4f(
    //   u_FragColor,
    //   rgba[0] * 0.7,
    //   rgba[1] * 0.7,
    //   rgba[2] * 0.7,
    //   rgba[3],
    // );
    // drawTriangle3D([0, 1, 0, 0, 1, 1, 1, 1, 1]);
    // drawTriangle3D([0, 1, 0, 1, 1, 1, 1, 1, 0]);
    //
    //

    // Pass the matrix to u_ModelMatrix attribute
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [1,0, 0,1, 1,1]);
    // Front of Cube
    // drawTriangle3D([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]);
    drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);
    // Back
    drawTriangle3D([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0]);
    drawTriangle3D([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] + 0.2,
      rgba[1] + 0.2,
      rgba[2] + 0.2,
      rgba[3],
    );
    // Top
    drawTriangle3D([0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3D([0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0]);
    // Bottom
    drawTriangle3D([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0]);
    drawTriangle3D([1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0]);

    gl.uniform4f(
      u_FragColor,
      rgba[0] + 0.15,
      rgba[1] + 0.15,
      rgba[2] + 0.15,
      rgba[3],
    );
    // Left
    drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0]);
    drawTriangle3D([0.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0]);
    gl.uniform4f(
      u_FragColor,
      rgba[0] + 0.1,
      rgba[1] + 0.1,
      rgba[2] + 0.1,
      rgba[3],
    );
    // Right
    drawTriangle3D([1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0]);
    drawTriangle3D([1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0]);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  }
}
