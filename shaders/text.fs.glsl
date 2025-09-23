precision mediump float;
uniform sampler2D uTex;
varying vec2 vUV;
uniform float uTime;

float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = vUV;
    vec3 textCol = texture2D(uTex, uv).rgb;
    float textWarpChance = 0.999;

    if(rand(vec2(uTime * 0.1, vUV.y * 10.0)) > textWarpChance) {
        float offset = (rand(vec2(uTime, vUV.y)) - 0.5) * 0.02;
        textCol = texture2D(uTex, vec2(vUV.x + offset, uv.y)).rgb;
    }

    float alpha = step(0.01, length(textCol));
    gl_FragColor = vec4(textCol, alpha);
}