precision mediump float;
uniform float uTime;
varying vec2 vUV;

void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUV, center);
    float wave = 0.5 + 0.5 * sin(20.0 * dist - uTime * 8.0);
    gl_FragColor = vec4(vec3(wave), 1.0);
}
