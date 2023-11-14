const fragmentShaderSource = `#version 300 es

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .01

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform vec2 u_resolution;

// get the time elapsed since the beginning of the program
uniform float iTime;

// we need to declare an output for the fragment shader
out vec4 outColor;

float GetDist(vec3 p ){
  vec4 s = vec4(2, 1, 10, 1);

  float sphereDist = length(p - s.xyz) - s.w;
  float planeDist = p.y;

  float d = min(planeDist, sphereDist);
  return d;
}

float RayMarch(vec3 ro, vec3 rd){
  float dO = 0.;

  for(int i =0; i< MAX_STEPS;i++){
    vec3 p = ro + rd * dO;
    float dS = GetDist(p);
    dO += dS;

    if(dO > MAX_DIST || dS < SURF_DIST) break;
  }

  return dO;
}

vec3 GetNormal(vec3 p){
  float d = GetDist(p);

  vec2 e = vec2(.01, 0);

  vec3 n = d - vec3(
    GetDist(p - e.xyy),
    GetDist(p - e.yxy),
    GetDist(p - e.yyx)
  );

  return normalize(n);
}

float GetLight(vec3 p){
  vec3 lightPos = vec3(2, 1, 10);
  lightPos.xz += vec2(sin(iTime / 2000.), cos(iTime / 2000.)) * 5.;

  vec3 l = normalize(lightPos-p);
  vec3 n = GetNormal(p);

  float dif = clamp(dot(n, l), 0., 1.);
  float d = RayMarch(p +n * SURF_DIST * 2., l);

  if(d < length(lightPos - p)) dif *= .1;
  return dif;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - u_resolution * .5) / u_resolution.y;

  vec3 col = vec3(0);

  vec3 ro = vec3(0, 1, 0);
  vec3 rd = normalize(vec3(uv.x, uv.y, 1));

  float d = RayMarch(ro, rd);

  vec3 p = ro + rd * d;
  float dif = GetLight(p);

  col = vec3(dif);

  outColor = vec4(col, 1);
}
`;
