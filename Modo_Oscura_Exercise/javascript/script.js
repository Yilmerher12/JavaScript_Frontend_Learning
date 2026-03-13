const btn = document.getElementById("btnCambiar");
const titulo = document.querySelector("h1");
const parrafo = document.getElementById("changeText");
const cuerpo = document.body;

btn.addEventListener("click", function() {
    // 1. Primero cambiamos el aspecto visual
    cuerpo.classList.toggle("dark-mode");

    // 2. Verificamos si la clase quedó puesta o no
    if (cuerpo.classList.contains("dark-mode")) {
        // ESTADO OSCURO ACTIVO
        btn.textContent = "light Mode";
        titulo.textContent = "Dark Mode";
        parrafo.textContent = "The dark side is active";
    } else {
        // ESTADO CLARO ACTIVO
        btn.textContent = "Dark Mode";
        titulo.textContent = "Light Mode";
        parrafo.textContent = "Light mode activate";
    }
});