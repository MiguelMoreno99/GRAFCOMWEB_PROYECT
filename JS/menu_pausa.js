document.addEventListener("DOMContentLoaded", () => {

    // Seleccionar los elementos
    const pausaMenu = document.getElementById("pausa");
    const opcionesMenu = document.getElementById("opciones");
    const opcionesLogin = document.getElementById("login");
    const btnOpciones = document.getElementById("btn-opciones");
    const btnVolverPausa = document.getElementById("btn-volver-pausa");
    const btnReanudar = document.getElementById("btn-reanudar");

    const params = new URLSearchParams(window.location.search);
    const modojuego = params.get('modo');

    if(modojuego === "multijugador"){
        opcionesLogin.style.display = "flex"; // Cambia a flex para que el menú sea visible
    }

    // Función para mostrar un menú y ocultar el otro
    function mostrarMenu(mostrar, ocultar) {
        mostrar.style.display = "flex"; // Cambia a flex para que el menú sea visible
        ocultar.style.display = "none"; // Oculta el otro menú
    }

    // Función para mostrar un menú y ocultar el otro
    function ocultarMenu(ocultar) {
        ocultar.style.display = "none"; // Oculta el otro menú
    }

    // Evento para la tecla "P" (pausa)
    document.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "p") {
            mostrarMenu(pausaMenu, opcionesMenu);
        }
    });

    // Evento para el botón de opciones
    btnOpciones.addEventListener("click", () => {
        mostrarMenu(opcionesMenu, pausaMenu);
    });

    // Evento para el botón de volver a pausa
    btnVolverPausa.addEventListener("click", () => {
        mostrarMenu(pausaMenu, opcionesMenu);
    });

    // Evento para el botón de ocultar el menu
    btnReanudar.addEventListener("click", () => {
        ocultarMenu(pausaMenu);
    });
});
