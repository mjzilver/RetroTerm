const COLS = 80;
const ROWS = 25;
const FONT_SIZE = 18;
const TEXT_COLOR = "#00FF55";
const BG_COLOR = "#000000";
const ACTIVE_BOOT_BAR_COLOR = "#00FF55";
const INACTIVE_BOOT_BAR_COLOR = "#004400";

const CURSOR_WIDTH = 10;
const CURSOR_HEIGHT = FONT_SIZE - 4;

const textBuffer = document.createElement("canvas");
textBuffer.width = COLS * (FONT_SIZE * 0.6);
textBuffer.height = ROWS * FONT_SIZE;
const ctx = textBuffer.getContext("2d");
ctx.font = `${FONT_SIZE}px "Cascadia Mono", monospace`;
ctx.textBaseline = "top";

const historyBuffer = [];
let screenBuffer = makeBuffer(ROWS, COLS);
let inputLine = "";
let takingInput = false;

const SHELL_MODE = "SHELL_MODE";
const APP_MODE = "APP_MODE";
let currentMode = SHELL_MODE;

let currentEffect = null;

let cursorVisible = true;
setInterval(() => cursorVisible = !cursorVisible, 500);

function handleCommand(cmd) {
    const parts = cmd.trim().split(/\s+/);
    if (!parts[0]) return;

    switch (parts[0]) {
        case "help":
            pushLine("Commands: help, clear, echo <txt>, reboot, matrix");
            break;
        case "echo":
            pushLine(parts.slice(1).join(" "));
            break;
        case "reboot":
            currentEffect = startBootEffect();
            historyBuffer.length = 0;
            break;
        case "clear":
            historyBuffer.length = 0;
            break;
        case "matrix":
            currentEffect = startMatrixEffect();
            break;
        default:
            pushLine("Unknown command: " + parts[0]);
    }
}

window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
        inputLine = "";
        clearInterval(currentEffect);
        takingInput = true;
        currentMode = SHELL_MODE;
        return;
    }

    if (!takingInput) return;

    if (e.key.length === 1 && !e.ctrlKey) {
        inputLine += e.key;
    } else if (e.key === "Backspace") {
        inputLine = inputLine.slice(0, -1);
    } else if (e.key === "Enter") {
        pushLine("> " + inputLine);
        handleCommand(inputLine);
        inputLine = "";
    }
});

function drawTextBuffer() {
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

startBootEffect();