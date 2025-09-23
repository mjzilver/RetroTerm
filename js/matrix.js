import { clearBuffer } from "./buffer";
import { screenBuffer } from "./terminal";

const MATRIX_SYMBOLS = [
    "ｱ", "ｲ", "ｳ", "ｴ", "ｵ", "ｶ", "ｷ", "ｸ", "ｹ", "ｺ",
    "ｻ", "ｼ", "ｽ", "ｾ", "ｿ", "ﾀ", "ﾁ", "ﾂ", "ﾃ", "ﾄ",
    "ﾅ", "ﾆ", "ﾇ", "ﾈ", "ﾉ", "ﾊ", "ﾋ", "ﾌ", "ﾍ", "ﾎ",
    "ﾏ", "ﾐ", "ﾑ", "ﾒ", "ﾓ", "ﾔ", "ﾕ", "ﾖ", "ﾗ", "ﾘ",
    "ﾙ", "ﾚ", "ﾛ", "ﾜ", "ﾝ", "0", "1", "2", "3", "4",
    "5", "6", "7", "8", "9", "A", "B", "C", "D", "E",
    "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
    "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y",
    "Z", "@", "#", "$", "%", "&", "*", "+", "-", "=",
    "م", "ح", "ب", "ة", "س", "ل", "ا", "م", "ك", "و"
];

export function drawMatrix() {
    for (let y = 0; y < ROWS - 1; y++) {
        for (let x = 0; x < COLS; x++) {
            if (Math.random() < 0.05) screenBuffer[y][x] = " ";
        }
    }
    for (let y = ROWS - 2; y > 0; y--) {
        for (let x = 0; x < COLS; x++) {
            screenBuffer[y][x] = screenBuffer[y - 1][x];
        }
    }
    for (let x = 0; x < COLS; x++) {
        if (screenBuffer[1][x] !== " " || Math.random() < 0.05) {
            screenBuffer[0][x] = MATRIX_SYMBOLS[Math.floor(Math.random() * MATRIX_SYMBOLS.length)];
        } else {
            screenBuffer[0][x] = " ";
        }
    }
}

export function startMatrixEffect() {
    takingInput = false;
    currentMode = APP_MODE;

    clearBuffer(screenBuffer);

    return interval = setInterval(() => {
        drawMatrix();
    }, 100);
}