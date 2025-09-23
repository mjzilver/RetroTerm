import {clearBuffer, writeText, pushLine} from './buffer.js';

let bootProgress = 0;
const BOOT_TOTAL = 20;

export function drawBootScreen() {
    clearBuffer(screenBuffer);

    const title = "Booting up TERM OS";
    const titleRow = Math.floor(ROWS / 2) - 2;
    const titleCol = Math.floor((COLS - title.length) / 2);
    writeText(titleRow, titleCol, title);

    const barRow = Math.floor(ROWS / 2);
    const barCol = Math.floor((COLS - BOOT_TOTAL) / 2);
    for (let i = 0; i < BOOT_TOTAL; i++) {
        screenBuffer[barRow][barCol + i] = i < bootProgress ? "█" : ".";
    }
}

export function startBootEffect() {
    takingInput = false;
    bootProgress = 0;
    currentMode = APP_MODE;

    return interval = setInterval(() => {
        if (bootProgress < BOOT_TOTAL) {
            bootProgress++;
            drawBootScreen();
        } else {
            clearInterval(interval);
            takingInput = true;
            currentMode = SHELL_MODE;
            pushLine("Boot complete!");
            pushLine("Type 'help' for commands.");
        }
    }, 100);
}
