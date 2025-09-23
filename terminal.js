export const COLS = 80;
export const ROWS = 25;
export const FONT_SIZE = 18;
export const TEXT_COLOR = "#00FF55";
export const BG_COLOR = "#000000";
export const ACTIVE_BOOT_BAR_COLOR  = "#00FF55";
export const INACTIVE_BOOT_BAR_COLOR  = "#004400";

export const CURSOR_WIDTH = 10;
export const CURSOR_HEIGHT = FONT_SIZE - 4;

export const textBuffer = document.createElement("canvas");
textBuffer.width = COLS * (FONT_SIZE * 0.6);
textBuffer.height = ROWS * FONT_SIZE;
export const ctx = textBuffer.getContext("2d");
ctx.font = `${FONT_SIZE}px "Consolas", monospace`;
ctx.textBaseline = "top";

export const historyBuffer = [];
export let screenBuffer = makeBuffer(ROWS, COLS);
export let inputLine = "";
export let takingInput = false;

const SHELL_MODE = "SHELL_MODE";
const APP_MODE = "APP_MODE";
let currentMode = SHELL_MODE;

let cursorVisible = true;
setInterval(() => cursorVisible = !cursorVisible, 500);

let bootProgress = 0;
const BOOT_TOTAL = 20;

function makeBuffer(rows, cols) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => " "));
}

function clearBuffer(buf) {
    for (let r = 0; r < buf.length; r++) {
        buf[r].fill(" ");
    }
}

function writeText(row, col, text) {
    for (let i = 0; i < text.length; i++) {
        let c = col + i;
        if (c >= 0 && c < COLS) {
            screenBuffer[row][c] = text[i];
        }
    }
}

export function drawBootScreen() {
    clearBuffer(screenBuffer);

    const title = "Booting up TERM OS";
    const titleRow = Math.floor(ROWS / 2) - 2;
    const titleCol = Math.floor((COLS - title.length) / 2);
    writeText(titleRow, titleCol, title);

    const barRow = Math.floor(ROWS / 2);
    const barCol = Math.floor((COLS - BOOT_TOTAL) / 2);
    for (let i = 0; i < BOOT_TOTAL; i++) {
        screenBuffer[barRow][barCol + i] = i < bootProgress ? "█" : "░";
    }
}

export function startBootSequence() {
    takingInput = false;
    bootProgress = 0;
    currentMode = APP_MODE;

    const interval = setInterval(() => {
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

export function pushLine(txt) {
    const lines = txt.split("\n");
    lines.forEach(line => {
        if (historyBuffer.length >= ROWS - 1) historyBuffer.shift();
        historyBuffer.push(line);
    });
}

export function handleCommand(cmd) {
    const parts = cmd.trim().split(/\s+/);
    if (!parts[0]) return;

    switch (parts[0]) {
        case "help":
            pushLine("Commands: help, clear, echo <txt>");
            break;
        case "echo":
            pushLine(parts.slice(1).join(" "));
            break;
        case "reboot":
            startBootSequence();
        case "clear":
            historyBuffer.length = 0;
            break;
        default:
            pushLine("Unknown command: " + parts[0]);
    }
}

window.addEventListener("keydown", (e) => {
    if (!takingInput) return;

    if (e.ctrlKey && e.key.toLowerCase() === "c") {
        inputLine = "";
        pushLine("^C");
        return;
    }

    if (e.key.length === 1 && !e.ctrlKey){
         inputLine += e.key;
    } else if (e.key === "Backspace") { 
        inputLine = inputLine.slice(0, -1);
    } else if (e.key === "Enter") {
        pushLine("> " + inputLine);
        handleCommand(inputLine);
        inputLine = "";
    }
});

export function drawTextBuffer() {
    if (currentMode == SHELL_MODE) {
        screenBuffer = makeBuffer(ROWS, COLS);
        const startLine = Math.max(0, historyBuffer.length - (ROWS - 1));
        let screenLine = 0;
        for (let i = startLine; i < historyBuffer.length; i++) {
            let line = historyBuffer[i];
            while (line.length > 0) {
                screenBuffer[screenLine] = line.slice(0, COLS).split("");
                line = line.slice(COLS);
                screenLine++;
                if (screenLine >= ROWS - 1) break;
            }
            if (screenLine >= ROWS - 1) break;
        }
    }

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, textBuffer.width, textBuffer.height);
    ctx.fillStyle = TEXT_COLOR;
    screenBuffer.forEach((row, i) => ctx.fillText(row.join(""), 2, i * FONT_SIZE));

    if (takingInput) {
        const line = "> " + inputLine;
        ctx.fillText(line, 2, (ROWS - 1) * FONT_SIZE);
        if (cursorVisible) {
            const x = ctx.measureText(line).width + 2;
            ctx.fillRect(x, (ROWS - 1) * FONT_SIZE, CURSOR_WIDTH, CURSOR_HEIGHT);
        }
    }
}

startBootSequence();