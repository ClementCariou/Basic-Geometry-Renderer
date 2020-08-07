'use strict';
module.exports = function (regl) {
  return regl({
    vert: `
      precision mediump float;
      attribute vec2 uv;
      uniform mat4 proj, view;
      uniform vec3 position;
      uniform float scale;
      varying vec2 v_uv;
      void main() {
        v_uv = uv;
        // Offset quad coords in view space
        vec4 offset = vec4(scale * uv.xy, 0, 0);
        gl_Position = proj * (offset + view * vec4(position, 1));
      }`,
    frag: `
      precision mediump float;
      uniform vec3 sunDir;
      uniform mat4 view;
      uniform vec3 color;

      varying vec2 v_uv;
      void main() {
        if(length(v_uv) > 1.0)
          discard;
        // Calculate fake normal
        float nz = sqrt(1.0 - v_uv.x*v_uv.x - v_uv.y*v_uv.y);
        vec3 normal = normalize(vec3(v_uv.xy, nz));
        // Apply shading
        vec3 lightDir = normalize(mat3(view) * sunDir);
        float diff = max(0.2, dot(normal, lightDir)*0.8 + 0.2);
        gl_FragColor = vec4(diff * color, 1);
      }`,
    attributes: {
      uv: [-1, -1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1]
    },
    uniforms: {
      position: regl.prop('position'),
      color: regl.prop('color')
    },
    count: 6
  });
}