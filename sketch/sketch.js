var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// all shaders have a main function
void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deconsteShader(shader);
  return undefined;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deconsteProgram(program);
  return undefined;
}

function main() {
  // Get A WebGL context
  const canvas = document.getElementById("webgl-canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    console.error("WebGL2 is not supported by the browser!");
    return;
  }

  // create GLSL shaders, upload the GLSL source, compile the shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );

  // Link the two shaders into a program
  const program = createProgram(gl, vertexShader, fragmentShader);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution",
  );

  const tickUniformLocation = gl.getUniformLocation(program, "iTime");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  // set width and height to the actual width and height using clientW|H
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  gl.bindVertexArray(vao);

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform1f(tickUniformLocation, (tick * 1000) / FPS);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // since we are trying to achieve everything using purely fragment shaders
  // draw a rectangle over the whole canvas each re-paint
  setRectangle(gl, 0, 0, gl.canvas.width, gl.canvas.height);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  tick++;
}

// Fill the buffer with the values that define a rectangle.
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW,
  );
}

const FPS = 60;
let tick = 0;
main();
setInterval(() => {
  try {
    main();
  } catch (err) {
    console.error(err);
  }
}, 1000 / FPS);
