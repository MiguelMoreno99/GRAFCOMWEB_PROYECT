document.addEventListener("DOMContentLoaded", () => {
    // Seleccionar los elementos
    const menu = document.getElementById("menu");
    const dificultad = document.getElementById("dificultad");
    const escenario = document.getElementById("escenario");
    const puntuaciones = document.getElementById("puntuaciones");
    const tutorial = document.getElementById("tutorial");

    const btnVolverEscenario = document.getElementById("btn-volver-escenario");
    const btnVolverDificultad = document.getElementById("btn-volver-dificultad");
    const btnVolverPuntuaciones = document.getElementById("btn-volver-puntuaciones");
    const btnVolverTutorial = document.getElementById("btn-volver-tutorial");

    const btnUnJugador = document.getElementById("btn-un-jugador");
    const btnMultijugador = document.getElementById("btn-multijugador");
    const btnNormal = document.getElementById("btn-normal");
    const btnDicil = document.getElementById("btn-dicil");
    const btnPuntuaciones = document.getElementById("btn-puntuaciones");
    const btnTutorial = document.getElementById("btn-tutorial");

    // Función para mostrar un menú y ocultar el otro
    function mostrarMenu(mostrar, ocultar) {
        mostrar.style.display = "flex"; // Cambia a flex para que el menú sea visible
        ocultar.style.display = "none"; // Oculta el otro menú
    }

    // Eventos para los botónes de opciones
    btnUnJugador.addEventListener("click", () => {
        mostrarMenu(dificultad, menu);
        // Agrega el modo al evento de clic de cada escenario
        document.querySelectorAll("#escenario a").forEach((link) => {
            if (link.href.includes("escenario")) {
                const url = new URL(link.href);
                url.searchParams.set("modo", "jugador"); // Añade el parámetro del modo
                link.href = url.toString(); // Actualiza el href con el nuevo URL
            }
        });
    });
    btnMultijugador.addEventListener("click", () => {
        mostrarMenu(dificultad, menu);
        // Agrega el modo al evento de clic de cada escenario
        document.querySelectorAll("#escenario a").forEach((link) => {
            if (link.href.includes("escenario")) {
                const url = new URL(link.href);
                url.searchParams.set("modo", "multijugador"); // Añade el parámetro del modo
                link.href = url.toString(); // Actualiza el href con el nuevo URL
            }
        });
    });
    // Eventos para los botónes de opciones
    btnNormal.addEventListener("click", () => {
        mostrarMenu(escenario, dificultad);
        // Agrega el modo al evento de clic de cada escenario
        document.querySelectorAll("#escenario a").forEach((link) => {
            if (link.href.includes("escenario")) {
                const url = new URL(link.href);
                url.searchParams.set("nivel", "normal"); // Añade el parámetro del modo
                link.href = url.toString(); // Actualiza el href con el nuevo URL
            }
        });
    });
    btnDicil.addEventListener("click", () => {
        mostrarMenu(escenario, dificultad);
        // Agrega el modo al evento de clic de cada escenario
        document.querySelectorAll("#escenario a").forEach((link) => {
            if (link.href.includes("escenario")) {
                const url = new URL(link.href);
                url.searchParams.set("nivel", "dificil"); // Añade el parámetro del modo
                link.href = url.toString(); // Actualiza el href con el nuevo URL
            }
        });
    });
    btnPuntuaciones.addEventListener("click", () => {
        mostrarMenu(puntuaciones, menu);
        fetch("http://localhost/CARSIMULATORFILE/obtener_puntuaciones.php")
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    const puntuaciones = data.data;
                    const tablaBody = document.getElementById("tabla-body");

                    // Vaciar la tabla
                    tablaBody.innerHTML = "";

                    // Llenar la tabla con las puntuaciones
                    puntuaciones.forEach((puntuacion, index) => {
                        const fila = document.createElement("tr");
                        fila.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${puntuacion.nombre}</td>
                        <td>${puntuacion.puntuacion}</td>
                    `;
                        tablaBody.appendChild(fila);
                    });
                } else {
                    console.error("Error al obtener puntuaciones:", data.message);
                }
            })
            .catch((error) => console.error("Error en la solicitud:", error));
    });
    btnTutorial.addEventListener("click", () => {
        mostrarMenu(tutorial, menu);
    });

    // Eventos para el botón de volver a menu
    btnVolverDificultad.addEventListener("click", () => {
        mostrarMenu(menu, dificultad);
    });
    btnVolverEscenario.addEventListener("click", () => {
        mostrarMenu(menu, escenario);
    });
    btnVolverPuntuaciones.addEventListener("click", () => {
        mostrarMenu(menu, puntuaciones);
    });
    btnVolverTutorial.addEventListener("click", () => {
        mostrarMenu(menu, tutorial);
    });
});
