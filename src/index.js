'use strict';
const mat4 = require('gl-mat4');
const vec3 = require('gl-vec3');

const regl = require('regl')();

const drawPoints = require('./points')(regl);
const drawLines = require('./lines')(regl);

const hue2rgb = (t) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return 6 * t;
  if (t < 1 / 2) return 1;
  if (t < 2 / 3) return (2 / 3 - t) * 6;
  return 0;
}

// Fibonacci sphere (http://extremelearning.com.au/evenly-distributing-points-on-a-sphere/)
const goldenRatio = (1 + Math.sqrt(5)) / 2;
const n = 40;
const points = Array(n).fill().map((_, i) => {
  const phi = Math.acos(1 - 2 * (i + 0.5) / n);
  const theta = 2 * Math.PI * (i + 0.5) / goldenRatio;
  return {
    position: vec3.normalize([], [
      Math.cos(theta) * Math.sin(phi),
      Math.sin(theta) * Math.sin(phi),
      Math.cos(phi)
    ]),
    color: [hue2rgb(i / n + 1 / 3), hue2rgb(i / n), hue2rgb(i / n - 1 / 3)]
  };
});
const lines = Array(n - 1).fill().map((_, i) => ({
  from: points[i].position,
  to: points[i + 1].position,
  color: vec3.lerp([], points[i].color, points[i + 1].color, 0.5)
}));

const view = [];
const proj = [];
const ctx = regl({
  uniforms: {
    view: ({
      time
    }) => mat4.lookAt(view, [2 * Math.cos(0.4 * time), 2, 2 * Math.sin(0.4 * time)], [0, 0, 0], [0, 1, 0]),
    proj: ({
        viewportWidth,
        viewportHeight
      }) => // Works better with an orthogonal projection
      mat4.ortho(proj, -1.1 * viewportWidth / viewportHeight, 1.1 * viewportWidth / viewportHeight, -1.1, 1.1, 0.1, 5),
    //mat4.perspective(proj, Math.PI / 3, viewportWidth / viewportHeight, 0.1, 10),
    sunDir: [1, 1, 1],
    scale: 0.05
  }
});

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  });
  ctx(() => {
    drawPoints(points);
    drawLines(lines);
  });
});