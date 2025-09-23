import { textBuffer, drawTextBuffer, booting, drawBootScreen } from './terminal.js';
import { getShaderSource } from './shader.js';

const canvas = document.getElementById("screenCanvas");
const gl = canvas.getContext("webgl");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", resize);
resize();

const vertexSrc = getShaderSource("vertex.vs.glsl");
const bgFragSrc = getShaderSource("bg.fs.glsl");
const textFragSrc = getShaderSource("text.fs.glsl");

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(shader);
    }
    return shader;
}

function createProgram(gl, vsSource, fsSource) {
    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw gl.getProgramInfoLog(program);
    }
    return program;
}

const bgProg = createProgram(gl, vertexSrc, bgFragSrc);
const textProg = createProgram(gl, vertexSrc, textFragSrc);
const posLoc = gl.getAttribLocation(bgProg, "aPos");
const bgTimeLoc = gl.getUniformLocation(bgProg, "uTime");
const textTexLoc = gl.getUniformLocation(textProg, "uTex");
const textTimeLoc = gl.getUniformLocation(textProg, "uTime");

const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
);
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

const tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.clearColor(0, 0, 0, 1);

function render(t) {
    if (booting) 
        drawBootScreen();
    else 
        drawTextBuffer();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textBuffer);

    gl.useProgram(bgProg);
    gl.uniform1f(bgTimeLoc, t * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.useProgram(textProg);
    gl.uniform1i(textTexLoc, 0);
    gl.uniform1f(textTimeLoc, t * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);
