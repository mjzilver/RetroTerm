precision mediump float;
varying vec2 vUV;
uniform float uTime;

const vec3 bgColor = vec3(0.05, 0.08, 0.03);
const float scanlines = 800.0;

float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    float line = floor(vUV.y * scanlines);
    float lineJitter = (rand(vec2(line, floor(uTime * 50.0))) - 0.5) * 2.0;

    float scanlines_n = scanlines + lineJitter;
    float scan = 0.85 + 0.15 * sin(vUV.y * scanlines_n + uTime * 0.5);

    vec3 noise_flicker = vec3((rand(vUV * uTime) - 0.5) * 0.01);
    float vig = smoothstep(0.9, 0.5, length(vUV - 0.5));

    vec3 col = bgColor * scan * vig + noise_flicker;
    gl_FragColor = vec4(col, 1.0);
}
