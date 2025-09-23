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
export let screenBuffer = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => " "));
export let inputLine = "";
export let takingInput = false;
export let booting = true;

let cursorVisible = true;
setInterval(() => cursorVisible = !cursorVisible, 500);

let bootProgress = 0;
const BOOT_TOTAL = 20;

export function drawBootScreen() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, textBuffer.width, textBuffer.height);

    ctx.fillStyle = TEXT_COLOR;
    const title = "Booting up TERM OS";
    const titleX = (textBuffer.width - ctx.measureText(title).width) / 2;
    const titleY = textBuffer.height / 2 - FONT_SIZE * 2;
    ctx.fillText(title, titleX, titleY);

    const barX = textBuffer.width / 2 - BOOT_TOTAL * (FONT_SIZE * 0.6) / 2;
    const barY = textBuffer.height / 2;
    for (let i = 0; i < BOOT_TOTAL; i++) {
        ctx.fillStyle = i < bootProgress ? ACTIVE_BOOT_BAR_COLOR : INACTIVE_BOOT_BAR_COLOR;
        ctx.fillText("█", barX + i * (FONT_SIZE * 0.6), barY);
    }
}

export function startBootSequence(onBootComplete) {
    booting = true;
    bootProgress = 0;
    const interval = setInterval(() => {
        if (bootProgress < BOOT_TOTAL) {
            bootProgress++;
            drawBootScreen();
        } else {
            clearInterval(interval);
            booting = false;
            takingInput = true;
            pushLine("Boot complete!");
            pushLine("Type 'help' for commands.");
            drawTextBuffer();
            if (onBootComplete) onBootComplete();
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
            startBootSequence(() => {
                takingInput = true;
                drawTextBuffer();
            });
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
        drawTextBuffer();
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

    drawTextBuffer();
});

export function drawTextBuffer(t = 0) {
    screenBuffer = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => " "));
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

startBootSequence(() => {
    takingInput = true;
    drawTextBuffer();
});