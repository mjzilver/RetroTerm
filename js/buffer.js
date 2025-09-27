function makeBuffer(rows, cols) {
    return Array.from({ length: rows }, () => 
        Array.from({ length: cols }, () => " "));
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

function pushLine(txt) {
    const lines = txt.split("\n");
    lines.forEach(line => {
        if (historyBuffer.length >= ROWS - 1) historyBuffer.shift();
        historyBuffer.push(line);
    });
}
