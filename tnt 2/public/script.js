// Código del juego (lo mismo que ya tienes)

const tnt = document.getElementById("tnt");
const clicksDisplay = document.getElementById("clicks");
const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const saveBtn = document.getElementById("saveBtn");
const nameInput = document.getElementById("nameInput");
const scoreTable = document.getElementById("scoreTable");

let clicks = 0;
let time = 20;
let interval;

tnt.addEventListener("click", () => {
    if (time > 0) {
        clicks++;
        clicksDisplay.textContent = clicks;
    }
});

startBtn.addEventListener("click", () => {
    clicks = 0;
    time = 20;
    clicksDisplay.textContent = "0";
    timeDisplay.textContent = "20";
    startBtn.disabled = true;
    saveBtn.disabled = true;
    nameInput.value = "";

    interval = setInterval(() => {
        time--;
        timeDisplay.textContent = time;
        if (time === 0) {
            clearInterval(interval);
            saveBtn.disabled = false;
        }
    }, 1000);
});

saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (name) {
        const response = await fetch('/save-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: name, score: clicks })
        });

        const result = await response.json();
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        const scoreCell = document.createElement("td");
        nameCell.textContent = name;
        scoreCell.textContent = clicks;
        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        scoreTable.appendChild(row);
        
        startBtn.disabled = false;
        saveBtn.disabled = true;
    }
});
