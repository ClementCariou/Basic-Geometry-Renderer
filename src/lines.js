'use strict';
module.exports = function (regl) {
  return regl({
    vert: `
      precision mediump float;
      attribute vec2 uv;
      uniform mat4 proj, view;
      uniform vec3 from, to;
      uniform float scale;

      varying vec2 v_uv;
      
      void main() {
        v_uv = uv;
        // Lerp between the two segment coords
        vec4 pos = vec4(mix(from, to, uv.x), 1);
        // Add thickness to the segment by offseting the corners
        vec4 dir = view * vec4(to - from, 1);
        vec3 norm = normalize(vec3(-dir.y, dir.x, 0));
        vec4 offset = 0.5 * scale * uv.y * vec4(norm, 0);
        gl_Position = proj * (offset + view * pos);
      }`,
    frag: `
      precision mediump float;
      uniform vec3 sunDir;
      uniform mat4 view;
      uniform vec3 from, to;
      uniform float scale;
      uniform vec3 color;
      
      varying vec2 v_uv;
      
      void main() {
        vec4 dir = view * vec4(to - from, 0);
        // Round segment ends
        float stretch = abs(normalize(dir.xyz).z) + 0.03;
        float dist = length(to - from) / scale;
        float newX = v_uv.x * dist;
        newX = min(newX - 1.0, 0.0) + max(newX - dist + 1.0, 0.0);
        vec2 uv =  vec2(newX, v_uv.y * stretch);
        if(length(uv) > stretch)
          discard;
        // Calculate fake normal
        vec3 norm = normalize(vec3(-dir.y, dir.x, 0));
        vec3 ortho = normalize(cross(vec3(dir.xy, 0), norm));
        float nx = sqrt(1.0 - v_uv.y*v_uv.y);
        vec3 normal = normalize(v_uv.y * norm + nx * ortho);
        // Apply shading
        vec3 lightDir = normalize(mat3(view) * sunDir);
        float diff = max(0.2, dot(normal, lightDir)*0.8 + 0.2);
        gl_FragColor = vec4(diff * color, 1);
      }`,
    attributes: {
      uv: [0, -1, 0, 1, 1, -1, 0, 1, 1, -1, 1, 1]
    },
    uniforms: {
      from: regl.prop('from'),
      to: regl.prop('to'),
      color: regl.prop('color')
    },
    count: 6
  });
}