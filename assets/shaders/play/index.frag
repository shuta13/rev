precision highp float;
uniform vec2 u_resolution;
void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  gl_FragColor = vec4(st.x, st.y, 1.0, 1.0);
}
