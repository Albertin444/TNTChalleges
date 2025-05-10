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

            body: JSON.stringify({
                Usuario: name,
                Correo: "sincorreo@mail.com",     // Si no lo necesitas, puedes poner un valor dummy
                Contrasena: "1234",               // Igual aquí, poner cualquier valor dummy
                Puntaje: clicks
            })

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


<script>
  // Puedes obtenerlo de localStorage, de una variable global o asignarlo manualmente:
    const usuarioActual = "Tan"; // Ejemplo: nombre que ya tienes del jugador

  document.addEventListener("DOMContentLoaded", () => {
        // Mostrar el nombre en pantalla
        document.getElementById("nombreUsuario").textContent = usuarioActual;
  });
</script>


//puntaje buscar
fetch('/scores')
    .then(response => response.json())
    .then(data => {
        const scoreTable = document.getElementById("scoreTable"); // asegúrate de que existe en el HTML
        scoreTable.innerHTML = "";
        data.forEach(usuario => {
            const row = document.createElement("tr");
            const nameCell = document.createElement("td");
            const scoreCell = document.createElement("td");

            nameCell.textContent = usuario.Usuario;
            scoreCell.textContent = usuario.Puntaje;

            row.appendChild(nameCell);
            row.appendChild(scoreCell);
            scoreTable.appendChild(row);
        });
    })
    .catch(error => {
        console.error("Error al cargar puntajes:", error);
    });

function guardarPuntaje(puntajeFinal) {
    const usuario = localStorage.getItem('usuarioActual');
    if (!usuario) {
        alert('Usuario no autenticado');
        return;
    }

    fetch('http://localhost:3000/update-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Usuario: usuario, Puntaje: puntajeFinal }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                alert('Puntaje guardado con éxito');
            } else {
                alert('Error al guardar puntaje: ' + data.error);
            }
        })
        .catch(err => console.error('Error al enviar puntaje:', err));
}


