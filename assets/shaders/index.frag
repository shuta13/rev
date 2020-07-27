#ifdef GL_ES
precision highp float;
#endif

uniform vec2 resolution;
uniform float time;
uniform sampler2D audioTexture;

// https://www.shadertoy.com/view/WlB3zc

float burn;

mat2 rot(float a)
{
  float s = sin(a);
  float c = cos(a);
    
  return mat2(s, c, -c, s);
}

float map(vec3 p) {
  // float i = time;
  float i = texture2D(audioTexture, vec2(0.3, 0.5)).r;
  
  float d1 = length(p) - 1. * i;
  
  //mat2 r = rot(-time / 3.0 + length(p));
  mat2 r = rot(time * 2.0 + length(p));
  p.xy *= r;
  p.zy *= r;
  
  p = abs(p);// - time;
  p = abs(p - floor(p + .5)) *  2.5 * i;
  
  //r = rot(time);
  //p.xy *= r;
  //p.xz *= r;
  
  float l1 = length(p.xy);
  float l2 = length(p.yz);
  float l3 = length(p.xz);
  
  float g = 0.01;
  float d2 = min(min(l1, l2), l3) + g;
  
  burn = pow(d2 - d1, 2.0);
  
  return min(d1, d2);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy - .5;
  vec3 ro = normalize(vec3(uv, 1.5));
  
  vec3 ta = vec3(0, 0, -2);
  
  float t = 0.;
  for  (int i = 0; i < 40; i++) {
    t += map(ta + ro * t) * 0.5;
  }

  gl_FragColor = vec4(1.0 - burn, 1.0 - burn, 1.0 - burn, 1.0);
}
