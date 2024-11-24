document.addEventListener("DOMContentLoaded", () => {
    // Seleccionar los elementos
    const menu = document.getElementById("menu");
    const escenario = document.getElementById("escenario");
    const puntuaciones = document.getElementById("puntuaciones");
    const tutorial = document.getElementById("tutorial");

    const btnVolverEscenario = document.getElementById("btn-volver-escenario");
    const btnVolverPuntuaciones = document.getElementById("btn-volver-puntuaciones");
    const btnVolverTutorial = document.getElementById("btn-volver-tutorial");

    const btnUnJugador = document.getElementById("btn-un-jugador");
    const btnMultijugador = document.getElementById("btn-multijugador");
    const btnPuntuaciones = document.getElementById("btn-puntuaciones");
    const btnTutorial = document.getElementById("btn-tutorial");

    // Función para mostrar un menú y ocultar el otro
    function mostrarMenu(mostrar, ocultar) {
        mostrar.style.display = "flex"; // Cambia a flex para que el menú sea visible
        ocultar.style.display = "none"; // Oculta el otro menú
    }

    // Eventos para los botónes de opciones
    btnUnJugador.addEventListener("click", () => {
        mostrarMenu(escenario, menu);
    });
    btnMultijugador.addEventListener("click", () => {
        mostrarMenu(escenario, menu);
    });
    btnPuntuaciones.addEventListener("click", () => {
        mostrarMenu(puntuaciones, menu);
    });
    btnTutorial.addEventListener("click", () => {
        mostrarMenu(tutorial, menu);
    });

    // Eventos para el botón de volver a menu
    btnVolverEscenario.addEventListener("click", () => {
        mostrarMenu(menu, escenario);
    });
    btnVolverPuntuaciones.addEventListener("click", () => {
        mostrarMenu(menu, puntuaciones);
    });
    btnVolverTutorial.addEventListener("click", () => {
        mostrarMenu(menu, tutorial);
    });

    function cargarEscenario(escenario) {
        // Redirige al archivo canvas.html con el escenario como parámetro
        window.location.href = `index.html?escenario=${escenario}`;
    }
});
