import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
    getDatabase,
    ref,
    onValue,
    set,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// Obtener el escenario de la URL
const params = new URLSearchParams(window.location.search);
const escenario = params.get('escenario');
const modojuego = params.get('modo');
const nivel = params.get('nivel');

if (escenario == null) {
    // Mostrar un mensaje al usuario y redirigirlo al menú principal
    alert("Escenario no válido. Regresando al menú principal...");
    window.location.href = 'menu_principal.html'
}
if (modojuego == null) {
    // Mostrar un mensaje al usuario y redirigirlo al menú principal
    alert("Modo de juego no válido. Regresando al menú principal...");
    window.location.href = 'menu_principal.html';
}
if (nivel == null) {
    // Mostrar un mensaje al usuario y redirigirlo al menú principal
    alert("Nivel no válido. Regresando al menú principal...");
    window.location.href = 'menu_principal.html';
}
if ((escenario != null) && (modojuego != null) && (nivel != null)) {
    alert("Para inicar el juego presiona la tecla ENTER");
}

// Your web app's Firebase configuration
let firebaseConfig = null;
// Initialize Firebase
let appp = null;
let provider = null;
let auth = null;
let db = null;
let buttonLogin = null;
let buttonLogout = null;
let loginMenu = null;
let currentUser;
// This gives you a Google Access Token. You can use it to access the Google API.
let credential = null;
let token = null;
// Handle Errors here.
let errorCode = null;
let errorMessage = null;
// The email of the user's account used.
let email = null;
// The AuthCredential type that was used.
let credential2 = null;
// Leer
let starCountRef = null;
let data = null;
let jugador = null;
let geometry = null;
let material = null;
let mesh = null;
let jugadorActual = null;

//Leer
function writeUserData(userId, positionX, positionZ) {
    set(ref(db, "jugadores/" + userId), {
        x: positionX,
        z: positionZ,
    });
}

if (modojuego === "multijugador") {
    loadMultiplayer()
}

const btnReanudar = document.getElementById("btn-reanudar");
const toggleMusica = document.getElementById('activar-musica');
const toggleSonidos = document.getElementById('activar-efectos');

const speed = 400.0;
const clock = new THREE.Clock();

// Cajas de colisión
const objetosConColision = []; // Array para almacenar los objetos que tienen colisión
const objetosConInterfaz = []; // Array para almacenar los objetos que tienen interfaz
const jugadorBox = new THREE.Box3(); // Caja de colisión del jugador
const jugadorHelper = new THREE.Box3Helper(jugadorBox, 0xff0000); // Rojo

let scene, camera, renderer, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let mouseLocked = false;
let gamePaused = false;
// Variables para el control de audio
let isMusicaActiva = true;
let isSonidosActivos = true;

// Variables para el control de countdown
let gameStarted = false;

// Crear el audio
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();
const audioJuego = new THREE.Audio(listener);
const audioIniciandoReparacion = new THREE.Audio(listener);
const audioReparacionFinalizada = new THREE.Audio(listener);
const audioObject = new THREE.Object3D();
// Añadir luces
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
//MostrarClisiones
const showColitions = true;
//nombres de los modelos
let weelG1w1p = null;
let weelG1w1 = null;
let weelG1w2 = null;
let weelG1w3 = null;
let weelG1w4 = null;
let engine1 = null;
let paper_tablet1 = null;
let car1 = null;
let car2 = null;
let mechanic = null;

let weel_wrench1 = null;
let weel_wrench1OriginalPosition = null; // Posición inicial del objeto

let extinguisher1 = null;
let extinguisher1OriginalPosition = null; // Posición inicial del objeto

let gasoline1 = null;
let gasoline1OriginalPosition = null; // Posición inicial del objeto

let impact_wrench1 = null;
let impact_wrench1OriginalPosition = null; // Posición inicial del objeto

let objetoEnMano = false; // Bandera para saber si el jugador tiene el objeto
let interfazMostrada = false; // Bandera para saber si el jugador se le muestra la interfaz
let nombreObjetoEnMano = "";

// Variables para la barra 
const recargaBarra = document.getElementById("recarga-barra");
const recargaLinea = document.getElementById("recarga-linea");
let moviendoDerecha = true; // Dirección del movimiento
let posicionLinea = 0;      // Posición actual (en píxeles)
let velocidadLinea = 1;
let tiempoJuego = 1; //en segundos
if (nivel == "normal") {
    velocidadLinea = 4;     // Velocidad de movimiento (píxeles por cuadro)
    tiempoJuego = 180;
}
if (nivel == "dificil") {
    velocidadLinea = 8;     // Velocidad de movimiento (píxeles por cuadro)
    tiempoJuego = 60;
}
let intervalo = null;
let puntuacionTotal = 0;
const marcador = document.getElementById("marcador");
let juegoFinalizado = false;

init();
animate();

function init() {
    // Crear la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    // Crear la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-38.81985205000609, 14, 25);
    camera.rotation.set(-0.6788501149592728, -1.5389407804029573, -0.6786021307204364)
    // Crear el renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    // Crear los controles de ratón (PointerLockControls)
    controls = new PointerLockControls(camera, document.body);

    scene.add(ambientLight);
    renderer.shadowMap.enabled = true; // Habilitar sombras

    addEventsListeners();
    loadAudio();
    loadScene();

    scene.add(jugadorHelper);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    if (!juegoFinalizado) {

        if (mouseLocked) {

            if (modojuego === "multijugador") {
                jugadorActual = scene.getObjectByName(currentUser.uid);
            }

            switch (event.code) {
                case 'Space':
                    detenerRecarga();
                    break;
                case 'KeyR':
                    if (objetoEnMano) {
                        iniciarRecarga();
                    }
                    break;
                case 'KeyE':
                    if (interfazMostrada) {
                        objetoEnMano = true;
                        console.log("se agarró objeto");
                    }
                    break;
                case 'KeyQ':
                    if (objetoEnMano) {
                        objetoEnMano = false;
                        console.log("se soltó objeto");
                        if ((weel_wrench1 != null) && (extinguisher1 != null) && (gasoline1 != null) && (impact_wrench1 != null)) {
                            weel_wrench1.position.x = weel_wrench1OriginalPosition.x;
                            weel_wrench1.position.y = weel_wrench1OriginalPosition.y;
                            weel_wrench1.position.z = weel_wrench1OriginalPosition.z;
                            extinguisher1.position.x = extinguisher1OriginalPosition.x;
                            extinguisher1.position.y = extinguisher1OriginalPosition.y;
                            extinguisher1.position.z = extinguisher1OriginalPosition.z;
                            gasoline1.position.x = gasoline1OriginalPosition.x;
                            gasoline1.position.y = gasoline1OriginalPosition.y;
                            gasoline1.position.z = gasoline1OriginalPosition.z;
                            impact_wrench1.position.x = impact_wrench1OriginalPosition.x;
                            impact_wrench1.position.y = impact_wrench1OriginalPosition.y;
                            impact_wrench1.position.z = impact_wrench1OriginalPosition.z;
                        }
                    }
                    break;
                case 'KeyW':
                    moveForward = true;
                    break;
                case 'KeyS':
                    moveBackward = true;
                    break;
                case 'KeyA':
                    moveLeft = true;
                    break;
                case 'KeyD':
                    moveRight = true;
                    break;
                case 'KeyP':
                    controls.unlock();  // Bloquea el puntero
                    mouseLocked = false
                    gamePaused = true
                    break;
                case 'KeyI':
                    console.log(camera.rotation);
                    console.log(camera.position);
                    break;
                case 'Escape':
                    mouseLocked = false;
                    break;
                case 'Enter':
                    if (gamePaused) {
                        controls.lock();  // Bloquea el puntero
                        mouseLocked = true;
                        if (isMusicaActiva) {
                            audioJuego.play();
                        }
                    }
                    if (!gameStarted) {
                        gameStarted = true;
                    }
                    break;
            }

            if (modojuego === "multijugador") {
                writeUserData(
                    currentUser.uid,
                    jugadorActual.position.x,
                    jugadorActual.position.z,

                    jugadorActual.rotation.x,
                    jugadorActual.rotation.y,
                    jugadorActual.rotation.z,
                );
            }

        } else {
            switch (event.code) {
                case 'Enter':
                    if (!gamePaused) {
                        controls.lock();  // Bloquea el puntero
                        mouseLocked = true;
                        if (isMusicaActiva) {
                            audioJuego.play();
                        }
                    }
                    if (!gameStarted) {
                        startCountdown(tiempoJuego, () => {
                            console.log("¡Tiempo terminado!");
                            finalizarJuego();
                            // Aquí puedes agregar lógica adicional si es necesario
                        });
                        gameStarted = true
                    }
                    break;
            }
        }
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = false;
            break;
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyA':
            moveLeft = false;
            break;
        case 'KeyD':
            moveRight = false;
            break;
        case 'Escape':
            mouseLocked = false;
            break;
    }
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();  // Obtener el tiempo transcurrido

    velocity.x -= velocity.x * 10.0 * delta;  // Frenar suavemente en el eje X
    velocity.z -= velocity.z * 10.0 * delta;  // Frenar suavemente en el eje Z

    direction.z = Number(moveForward) - Number(moveBackward);  // Delante/Atrás
    direction.x = Number(moveRight) - Number(moveLeft);        // Derecha/Izquierda
    direction.normalize();  // Normalizar la dirección para que no sea más rápido en diagonal

    if (moveForward || moveBackward) {
        velocity.z += direction.z * speed * delta;
    }
    if (moveLeft || moveRight) {
        velocity.x -= direction.x * speed * delta;
    }

    // Guardar la posición actual del jugador
    const prevPosition = controls.object.position.clone();

    // Mover el jugador
    controls.object.position.addScaledVector(
        controls.object.getWorldDirection(new THREE.Vector3()).setY(0),
        velocity.z * delta
    );
    controls.object.position.addScaledVector(
        new THREE.Vector3()
            .crossVectors(camera.up, controls.object.getWorldDirection(new THREE.Vector3()))
            .normalize(),
        velocity.x * delta
    );

    if (modojuego === "multijugador") {
        // Comprobar si la posición ha cambiado
        if (!prevPosition.equals(controls.object.position)) {
            jugadorActual.position.x = controls.object.position.x;
            jugadorActual.position.z = (controls.object.position.z);
        }
        if (jugadorActual != null) {
            if (jugadorActual.rotation.y != camera.rotation.y) {
                jugadorActual.rotation.x = camera.rotation.x;
                jugadorActual.rotation.y = camera.rotation.y;
                jugadorActual.rotation.z = camera.rotation.z;
            }
        }

    } else if (modojuego === "jugador") {
        if (mechanic != null) {
            mechanic.position.x = controls.object.position.x;
            mechanic.position.z = controls.object.position.z;

            mechanic.rotation.x = camera.rotation.x;
            mechanic.rotation.y = camera.rotation.y;
            mechanic.rotation.z = camera.rotation.z;
        }
    }

    if (objetoEnMano) {
        if ((weel_wrench1 != null) && (extinguisher1 != null) && (gasoline1 != null) && (impact_wrench1 != null)) {
            if (nombreObjetoEnMano === "Llave X") {
                weel_wrench1.position.x = (controls.object.position.x);
                weel_wrench1.position.y = (controls.object.position.y) - 4;
                weel_wrench1.position.z = (controls.object.position.z) + 4;
            }
            if (nombreObjetoEnMano === "Extintor") {
                extinguisher1.position.x = (controls.object.position.x);
                extinguisher1.position.y = (controls.object.position.y) - 4;
                extinguisher1.position.z = (controls.object.position.z) + 4;
            }
            if (nombreObjetoEnMano === "Gasolina") {
                gasoline1.position.x = (controls.object.position.x);
                gasoline1.position.y = (controls.object.position.y) - 4;
                gasoline1.position.z = (controls.object.position.z) + 4;
            }
            if (nombreObjetoEnMano === "Pistola de Impacto") {
                impact_wrench1.position.x = (controls.object.position.x);
                impact_wrench1.position.y = (controls.object.position.y) - 4;
                impact_wrench1.position.z = (controls.object.position.z) + 4;
            }
        }
    }

    // Actualizar la caja del jugador
    jugadorBox.setFromCenterAndSize(
        controls.object.position,
        new THREE.Vector3(5, 10, 5) // Tamaño del jugador (puedes ajustar esto)
    );

    // Comprobar colisiones
    for (let i = 0; i < objetosConColision.length; i++) {
        const val = typeof objetosConColision[i];
        if (val === "object") {
            if (jugadorBox.intersectsBox(objetosConColision[i])) {
                // Si hay colisión, revertir a la posición anterior
                controls.object.position.copy(prevPosition);
                console.log("Colision con: ", objetosConColision[i + 1]);
                break; // Salir del bucle al detectar colisión
            }
        }
    }
    // Comprobar colisiones
    for (let i = 0; i < objetosConInterfaz.length; i++) {
        const val = typeof objetosConInterfaz[i];
        if (val === "object") {
            if (jugadorBox.intersectsBox(objetosConInterfaz[i])) {
                // Si hay colisión, revertir a la posición anterior
                controls.object.position.copy(prevPosition);
                console.log("Colision con interfaz: ", objetosConInterfaz[i + 1]);
                if (!objetoEnMano) {
                    mostrarMensaje("Presione la tecla E para agarrar " + objetosConInterfaz[i + 1]);
                    nombreObjetoEnMano = objetosConInterfaz[i + 1];
                }
                break; // Salir del bucle al detectar colisión
            }
            else if (interfazMostrada) {
                ocultarMensaje();
            }
        }
    }

    renderer.render(scene, camera);
}

function loadGLTFmodel(path, posx, posy, posz, scalex, scaley, scalez, rotx, roty, rotz, helper) {
    // Retornar una promesa para manejar la carga del modelo
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();

        loader.load(
            path,
            (gltf) => {
                const model = gltf.scene;
                model.position.set(posx, posy, posz);  // Posición del modelo
                model.scale.set(scalex, scaley, scalez);  // Escala del modelo
                model.rotation.set(rotx, roty, rotz);  // Rotación del modelo

                // Añadir el modelo a la escena
                scene.add(model);

                if (helper) {
                    // Añadir AxesHelper si se requiere
                    const axesHelper = new THREE.AxesHelper(30); // Longitud de los ejes
                    model.add(axesHelper);
                }

                // Resolver la promesa con el modelo cargado
                resolve(model);
            },
            undefined,
            (error) => {
                console.error('Error al cargar el modelo:', error);
                reject(error); // Rechazar la promesa en caso de error
            }
        );
    });
}

async function loadLvL1Models() {
    //Añadir modelos
    const garage1 = await loadGLTFmodel('../models/garage4/scene.gltf', 0, -3, 0, 1, 1, 1, 0, 0, 0, false);
    const cealingG1_1 = await loadGLTFmodel('../models/fake_drop_ceiling/scene.gltf', 39, 31, -24, 20, 1, 20, 0, 0, 0, false);
    const cealingG1_2 = await loadGLTFmodel('../models/fake_drop_ceiling/scene.gltf', -1, 31, -24, 20, 1, 20, 0, 0, 0, false);
    const cealingG1_3 = await loadGLTFmodel('../models/fake_drop_ceiling/scene.gltf', -41.5, 31, -24, 20.5, 1, 20, 0, 0, 0, false);
    const cealingG1_4 = await loadGLTFmodel('../models/fake_drop_ceiling/scene.gltf', -41.5, 31, 14.5, 20.5, 1, 18.5, 0, 0, 0, false);
    const cealingG1_5 = await loadGLTFmodel('../models/fake_drop_ceiling/scene.gltf', -1, 31, 14.5, 20, 1, 18.5, 0, 0, 0, false);
    const cealingG1_6 = await loadGLTFmodel('../models/fake_drop_ceiling/scene.gltf', 39, 31, 14.5, 20, 1, 18.5, 0, 0, 0, false);
    const garage2 = await loadGLTFmodel('../models/garage4/scene.gltf', -3, -3, 65.85, 1, 1, 1, 0, Math.PI, 0, false);
    const val = 77;
    const cealingG2_1 = await loadGLTFmodel('../models/fake_drop_ceiling/scene.gltf', 39, 31, -24 + val, 20, 1, 20, 0, 0, 0, false);
    const cealingG2_2 = await loadGLTFmodel('../models/fake_drop_ceiling/scene.gltf', -1, 31, -24 + val, 20, 1, 20, 0, 0, 0, false);
    const cealingG2_3 = await loadGLTFmodel('../models/fake_drop_ceiling/scene.gltf', -41.5, 31, -24 + val, 20.5, 1, 20, 0, 0, 0, false);
    const cealingG2_4 = await loadGLTFmodel('../models/fake_drop_ceiling/scene.gltf', -41.5, 31, 14.5 + val, 20.5, 1, 18.5, 0, 0, 0, false);
    const cealingG2_5 = await loadGLTFmodel('../models/fake_drop_ceiling/scene.gltf', -1, 31, 14.5 + val, 20, 1, 18.5, 0, 0, 0, false);
    const cealingG2_6 = await loadGLTFmodel('../models/fake_drop_ceiling/scene.gltf', 39, 31, 14.5 + val, 20, 1, 18.5, 0, 0, 0, false);
    weelG1w1p = await loadGLTFmodel('../models/props/weel.glb', -17.8, 4.5, -.5, 8.5, 8.5, 8.5, 0, (Math.PI / 2) * -1, 0, false);
    weelG1w1 = await loadGLTFmodel('../models/props/weel.glb', 43, 3.2, -16.5, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);
    weelG1w2 = await loadGLTFmodel('../models/props/weel.glb', 43, 3.2, -25, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);
    weelG1w3 = await loadGLTFmodel('../models/props/weel.glb', 43, 10, -16.5, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);
    weelG1w4 = await loadGLTFmodel('../models/props/weel.glb', 43, 10, -25, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);
    weel_wrench1 = await loadGLTFmodel('../models/props/weel_wrench.glb', -18, 9, -40, 18, 18, 18, 0, 0, 0, false);
    weel_wrench1OriginalPosition = await weel_wrench1.position.clone();
    extinguisher1 = await loadGLTFmodel('../models/props/extinguisher.glb', 5, 3.5, 13, .11, .11, .11, 0, 0, 0, false);
    extinguisher1OriginalPosition = await extinguisher1.position.clone();
    gasoline1 = await loadGLTFmodel('../models/props/gasoline.glb', 54, 10.2, 20, 15, 15, 15, 0, 0, 0, false);
    gasoline1OriginalPosition = await gasoline1.position.clone();
    engine1 = await loadGLTFmodel('../models/props/engine3.glb', 42, 4.6, -6, .4, .4, .4, 0, 0, 0, false);
    impact_wrench1 = await loadGLTFmodel('../models/props/impact_wrench.glb', -53, 7.6, 11, 10, 10, 10, 0, 0, 0, false);
    impact_wrench1OriginalPosition = await impact_wrench1.position.clone();
    paper_tablet1 = await loadGLTFmodel('../models/props/paper_tablet.glb', 14.6, 9.01, -38.7, 10, 10, 10, Math.PI / 2 * -1, 0, 0, false);
    if (modojuego === "jugador") {
        mechanic = await loadGLTFmodel('../models/props/car_mechanic.glb', -40, -1, 40, 7, 7, 7, 0, 0, 0, false);
    }

    if ((weel_wrench1OriginalPosition != null) && (weel_wrench1OriginalPosition != null) && (weel_wrench1OriginalPosition != null) && (weel_wrench1OriginalPosition != null)) {
        const weel_wrench = loadBoxColition(10, 10, 10, weel_wrench1OriginalPosition.x, weel_wrench1OriginalPosition.y, weel_wrench1OriginalPosition.z, showColitions, "Llave X", true);
        const extinguisher = loadBoxColition(10, 15, 10, extinguisher1OriginalPosition.x, extinguisher1OriginalPosition.y, extinguisher1OriginalPosition.z, showColitions, "Extintor", true);
        const gasoline = loadBoxColition(10, 15, 10, gasoline1OriginalPosition.x, gasoline1OriginalPosition.y, gasoline1OriginalPosition.z, showColitions, "Gasolina", true);
        const impact_wrench = loadBoxColition(10, 15, 10, impact_wrench1OriginalPosition.x, impact_wrench1OriginalPosition.y, impact_wrench1OriginalPosition.z, showColitions, "Pistola de Impacto", true);
        console.log("Special objects loaded");
    }
    // Crear las paredes con colisión
    const pared1 = loadBoxColition(130, 35, 8, 0, 15, -40, showColitions, "pared1");
    const pared2 = loadBoxColition(130, 35, 8, 0, 15, 107, showColitions, "pared2");
    const pared3 = loadBoxColition(8, 35, 150, -60, 15, 30, showColitions, "pared3");
    const pared4 = loadBoxColition(8, 35, 150, 60, 15, 30, showColitions, "pared4");
    const carro1 = loadBoxColition(38, 35, 15, -31, 15, -7, showColitions, "carro1");
    const carro2 = loadBoxColition(38, 35, 15, 29, 15, 74, showColitions, "carro2");
}

async function loadLvL2Models() {
    const garage3 = await loadGLTFmodel('../models/garage5/scene.gltf', 0, 0, 0, 10, 10, 10, 0, 0, 0, false);
    const garage3_2 = await loadGLTFmodel('../models/garage5/scene.gltf', -1, 0, 147.8, 10, 10, 10, 0, Math.PI, 0, false);
    const wall1 = await loadGLTFmodel('../models/props/wall.glb', -60, -1, 80, 30, 30, 30, 0, Math.PI / 2, 0, false);
    const wall2 = await loadGLTFmodel('../models/props/wall.glb', 60, -1, 70, 30, 30, 30, 0, Math.PI / 2 * -1, 0, false);
    const wall3 = await loadGLTFmodel('../models/props/wall.glb', 0, -1, -37, 20, 30, 30, 0, 0, 0, false);
    const wall4 = await loadGLTFmodel('../models/props/wall.glb', 0, -1, 197, 20, 30, 30, 0, 0, 0, false);
    weelG1w1 = await loadGLTFmodel('../models/props/weel.glb', 43, 3.2, -16.5, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);
    weelG1w2 = await loadGLTFmodel('../models/props/weel.glb', 43, 3.2, -25, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);
    weelG1w3 = await loadGLTFmodel('../models/props/weel.glb', 43, 10, -16.5, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);
    weelG1w4 = await loadGLTFmodel('../models/props/weel.glb', 43, 10, -25, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);
    weel_wrench1 = await loadGLTFmodel('../models/props/weel_wrench.glb', -18, 9, -40, 18, 18, 18, 0, 0, 0, false);
    weel_wrench1OriginalPosition = await weel_wrench1.position.clone();
    extinguisher1 = await loadGLTFmodel('../models/props/extinguisher.glb', 36, 3.5, -43.1, .11, .11, .11, 0, 0, 0, false);
    extinguisher1OriginalPosition = await extinguisher1.position.clone();
    gasoline1 = await loadGLTFmodel('../models/props/gasoline.glb', 54, 10.2, 20, 15, 15, 15, 0, 0, 0, false);
    gasoline1OriginalPosition = await gasoline1.position.clone();
    engine1 = await loadGLTFmodel('../models/props/engine3.glb', 42, 4.6, -6, .4, .4, .4, 0, 0, 0, false);
    impact_wrench1 = await loadGLTFmodel('../models/props/impact_wrench.glb', -53, 7.6, 11, 10, 10, 10, 0, 0, 0, false);
    impact_wrench1OriginalPosition = await impact_wrench1.position.clone();
    paper_tablet1 = await loadGLTFmodel('../models/props/paper_tablet.glb', 14.6, 9.01, -38.7, 10, 10, 10, Math.PI / 2 * -1, 0, 0, false);
    car1 = await loadGLTFmodel('../models/props/car5.glb', 41, 5, 77, 18, 18, 18, 0, 0, 0, false);
    car2 = await loadGLTFmodel('../models/props/car5.glb', -41, 5, 55, 18, 18, 18, 0, 0, 0, false);
    if (modojuego === "jugador") {
        mechanic = await loadGLTFmodel('../models/props/car_mechanic.glb', -40, -1, 40, 7, 7, 7, 0, 0, 0, false);
    }
    if ((weel_wrench1OriginalPosition != null) && (weel_wrench1OriginalPosition != null) && (weel_wrench1OriginalPosition != null) && (weel_wrench1OriginalPosition != null)) {
        const weel_wrench = loadBoxColition(10, 10, 10, weel_wrench1OriginalPosition.x, weel_wrench1OriginalPosition.y, weel_wrench1OriginalPosition.z, showColitions, "Llave X", true);
        const extinguisher = loadBoxColition(10, 15, 10, extinguisher1OriginalPosition.x, extinguisher1OriginalPosition.y, extinguisher1OriginalPosition.z, showColitions, "Extintor", true);
        const gasoline = loadBoxColition(10, 15, 10, gasoline1OriginalPosition.x, gasoline1OriginalPosition.y, gasoline1OriginalPosition.z, showColitions, "Gasolina", true);
        const impact_wrench = loadBoxColition(10, 15, 10, impact_wrench1OriginalPosition.x, impact_wrench1OriginalPosition.y, impact_wrench1OriginalPosition.z, showColitions, "Pistola de Impacto", true);
        console.log("Special objects loaded");
    }
}

async function loadLvL3Models() {
    const garage2 = await loadGLTFmodel('../models/underground_parking/scene.gltf', 0, .1, 0, 12, 12, 12, 0, 0, 0, false);
    weelG1w1 = await loadGLTFmodel('../models/props/weel.glb', 43, 3.2, -16.5, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);
    weelG1w2 = await loadGLTFmodel('../models/props/weel.glb', 43, 3.2, -25, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);
    weelG1w3 = await loadGLTFmodel('../models/props/weel.glb', 43, 10, -16.5, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);
    weelG1w4 = await loadGLTFmodel('../models/props/weel.glb', 43, 10, -25, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);
    weel_wrench1 = await loadGLTFmodel('../models/props/weel_wrench.glb', -18, 9, -40, 18, 18, 18, 0, 0, 0, false);
    weel_wrench1OriginalPosition = await weel_wrench1.position.clone();
    extinguisher1 = await loadGLTFmodel('../models/props/extinguisher.glb', 36, 3.5, -43.1, .11, .11, .11, 0, 0, 0, false);
    extinguisher1OriginalPosition = await extinguisher1.position.clone();
    gasoline1 = await loadGLTFmodel('../models/props/gasoline.glb', 54, 10.2, 20, 15, 15, 15, 0, 0, 0, false);
    gasoline1OriginalPosition = await gasoline1.position.clone();
    engine1 = await loadGLTFmodel('../models/props/engine3.glb', 42, 4.6, -6, .4, .4, .4, 0, 0, 0, false);
    impact_wrench1 = await loadGLTFmodel('../models/props/impact_wrench.glb', -53, 7.6, 11, 10, 10, 10, 0, 0, 0, false);
    impact_wrench1OriginalPosition = await impact_wrench1.position.clone();
    paper_tablet1 = await loadGLTFmodel('../models/props/paper_tablet.glb', 14.6, 9.01, -38.7, 10, 10, 10, Math.PI / 2 * -1, 0, 0, false);
    car1 = await loadGLTFmodel('../models/props/car5.glb', 0, 5, 0, 18, 18, 18, 0, 0, 0, false);
    car2 = await loadGLTFmodel('../models/props/car5.glb', 30, 5, 0, 18, 18, 18, 0, 0, 0, false);
    if (modojuego === "jugador") {
        mechanic = await loadGLTFmodel('../models/props/car_mechanic.glb', -40, 1, 40, 7, 7, 7, 0, 0, 0, false);
    }
    if ((weel_wrench1OriginalPosition != null) && (weel_wrench1OriginalPosition != null) && (weel_wrench1OriginalPosition != null) && (weel_wrench1OriginalPosition != null)) {
        const weel_wrench = loadBoxColition(10, 10, 10, weel_wrench1OriginalPosition.x, weel_wrench1OriginalPosition.y, weel_wrench1OriginalPosition.z, showColitions, "Llave X", true);
        const extinguisher = loadBoxColition(10, 15, 10, extinguisher1OriginalPosition.x, extinguisher1OriginalPosition.y, extinguisher1OriginalPosition.z, showColitions, "Extintor", true);
        const gasoline = loadBoxColition(10, 15, 10, gasoline1OriginalPosition.x, gasoline1OriginalPosition.y, gasoline1OriginalPosition.z, showColitions, "Gasolina", true);
        const impact_wrench = loadBoxColition(10, 15, 10, impact_wrench1OriginalPosition.x, impact_wrench1OriginalPosition.y, impact_wrench1OriginalPosition.z, showColitions, "Pistola de Impacto", true);
        console.log("Special objects loaded");
    }
}

function loadAudio() {
    //Audio del juego
    audioLoader.load('../AUDIO/Spark_Elwood.mp3', function (buffer) {
        audioJuego.setBuffer(buffer);
        audioJuego.setLoop(true);
        audioJuego.setVolume(.5); // ajustar el volumen (de 0 a 1)
        audioJuego.play();
        audioJuego.pause();
    });

    //Audio de efecto
    audioLoader.load('../AUDIO/iniciandoReparacion.mp3', function (buffer) {
        audioIniciandoReparacion.setBuffer(buffer);
        audioIniciandoReparacion.setLoop(true);
        audioIniciandoReparacion.setVolume(0.6); // ajustar el volumen (de 0 a 1)
        audioIniciandoReparacion.play();
        audioIniciandoReparacion.pause();
    });

    //Audio de efecto
    audioLoader.load('../AUDIO/reparacionExitosa.mp3', function (buffer) {
        audioReparacionFinalizada.setBuffer(buffer);
        audioReparacionFinalizada.setLoop(true);
        audioReparacionFinalizada.setVolume(0.6); // ajustar el volumen (de 0 a 1)
        audioReparacionFinalizada.play();
        audioReparacionFinalizada.pause();
    });

    // Evento para detectar cambios en los checkboxes
    toggleMusica.addEventListener('change', (event) => {
        isMusicaActiva = event.target.checked;
        if (isMusicaActiva) {
            audioJuego.play();
        } else {
            audioJuego.pause();
        }
    });

    toggleSonidos.addEventListener('change', (event) => {
        isSonidosActivos = event.target.checked;
        if (isSonidosActivos) {

        } else {

        }
    });

    audioObject.add(audioJuego);
    camera.add(audioObject); // Agregar el objeto contenedor a la cámara
    audioObject.add(audioIniciandoReparacion);
    camera.add(audioObject); // Agregar el objeto contenedor a la cámara
    audioObject.add(audioReparacionFinalizada);
    camera.add(audioObject); // Agregar el objeto contenedor a la cámara
}

function addEventsListeners() {
    // Evento para el botón de ocultar el menu
    btnReanudar.addEventListener("click", () => {
        controls.lock();
        mouseLocked = true;
        gamePaused = false
    });

    // Evento de teclas para movimiento
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Ajustar la ventana en caso de cambio de tamaño
    window.addEventListener('resize', onWindowResize, false);

    document.getElementById("guardar-puntuacion").addEventListener("click", () => {
        const nombre = document.getElementById("nombre-usuario").value;

        if (nombre.trim() === "") {
            alert("Por favor, ingresa tu nombre.");
            return;
        }

        fetch('http://localhost/CARSIMULATORFILE/guardar_puntuacion.php', { // URL del archivo PHP
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre,
                puntuacion: puntuacionTotal
            })
        })
            .then((response) => response.text())
            .then((data) => {
                alert('Se guardo la puntuación.');
                window.location.href = 'menu_principal.html';
            })
            .catch((error) => {
                console.error('Error al guardar la puntuación:', error);
                alert('Hubo un error al guardar la puntuación.');
            });
    });
}

function loadScene() {
    // Determinar qué escenario cargar
    if (escenario === 'escenario1') {
        loadLvL1Models();
    } else if (escenario === 'escenario2') {
        loadLvL2Models();
    } else if (escenario === 'escenario3') {
        loadLvL3Models();
    }
}

function loadBoxColition(x, y, z, posx, posy, posz, visible = false, name, withInterface = false) {
    // Material configurable
    const material = visible
        ? new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.3,
        })
        : new THREE.MeshBasicMaterial({ visible: false });

    // Crear el Mesh (caja)
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(x, y, z), material);
    mesh.position.set(posx, posy, posz);
    scene.add(mesh);

    // Crear la caja de colisión
    const box = new THREE.Box3().setFromObject(mesh);

    if (withInterface) {
        // Agregar a los objetos con interfaz
        objetosConInterfaz.push(box, name);
    } else {
        // Agregar a los objetos con colisión
        objetosConColision.push(box, name);
    }

    // Devolver el Mesh y la Box3
    return { mesh, box };
}

function startCountdown(durationInSeconds, onComplete) {
    const countdownElement = document.getElementById('countdown');
    let remainingTime = durationInSeconds;

    function updateCountdown() {
        // Calcular minutos y segundos
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;

        // Actualizar el texto del elemento HTML
        countdownElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (remainingTime > 0) {
            remainingTime--; // Reducir tiempo restante
        } else {
            clearInterval(timerInterval); // Detener el intervalo
            if (onComplete) onComplete(); // Llamar a la función de completado
        }
    }

    // Actualizar inmediatamente y luego cada segundo
    updateCountdown();
    const timerInterval = setInterval(updateCountdown, 1000);
}

function loadMultiplayer() {

    // Your web app's Firebase configuration
    firebaseConfig = {
        apiKey: "AIzaSyBkWltPwV8BQJ5hgV8laGcir6yXC-J-PhM",
        authDomain: "coordenadas2-2deae.firebaseapp.com",
        databaseURL: "https://coordenadas2-2deae-default-rtdb.firebaseio.com",
        projectId: "coordenadas2-2deae",
        storageBucket: "coordenadas2-2deae.firebasestorage.app",
        messagingSenderId: "57386903690",
        appId: "1:57386903690:web:2ffb323eeb5e86e7e12573"
    };

    // Initialize Firebase
    appp = initializeApp(firebaseConfig);
    provider = new GoogleAuthProvider();
    auth = getAuth();
    db = getDatabase();

    buttonLogin = document.getElementById("button-login");
    buttonLogout = document.getElementById("button-logout");

    loginMenu = document.getElementById("login");

    currentUser;
    async function login() {
        await signInWithPopup(auth, provider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                credential = GoogleAuthProvider.credentialFromResult(result);
                token = credential.accessToken;
                // The signed-in user info.
                currentUser = result.user;
                writeUserData(currentUser.uid, 0, 0);
            })
            .catch((error) => {
                // Handle Errors here.
                errorCode = error.code;
                errorMessage = error.message;
                // The email of the user's account used.
                email = error.customData.email;
                // The AuthCredential type that was used.
                credential2 = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
    }

    buttonLogin.addEventListener("click", async () => {
        await login();
        loginMenu.style.display = "none";
    });

    buttonLogout.addEventListener("click", async () => {
        await signOut(auth)
            .then(() => {
                // Sign-out successful.
                console.log("Sign-out successful");
            })
            .catch((error) => {
                // An error happened.
                console.log("An error happened", error);
            });
    });
    // Leer
    starCountRef = ref(db, "jugadores");
    onValue(starCountRef, (snapshot) => {
        data = snapshot.val();
        Object.entries(data).forEach(async ([key, value]) => {
            console.log(`${key} ${value.x} ${value.z}`);

            jugador = scene.getObjectByName(key);

            if (!jugador) {
                // geometry = new THREE.BoxGeometry(1, 1, 1);
                // material = new THREE.MeshPhongMaterial();
                // mesh = new THREE.Mesh(geometry, material);
                // mesh.castShadow = true;
                // mesh.position.set(value.x, 17, value.z);
                // mesh.material.color = new THREE.Color(Math.random() * 0xffffff);
                // mesh.name = key;
                mesh = await loadGLTFmodel('../models/props/car_mechanic.glb', -40, 1, 40, 7, 7, 7, 0, 0, 0, false);
                mesh.castShadow = true;
                mesh.position.set(value.x, -2, value.z);
                mesh.name = key;
                scene.add(mesh);
            }

            scene.getObjectByName(key).position.x = value.x;
            scene.getObjectByName(key).position.z = value.z;
        });
    });
    jugadorActual = null;
}

function iniciarRecarga() {
    recargaBarra.style.display = "block"; // Mostrar la barra
    posicionLinea = 0;                    // Reiniciar la posición
    moviendoDerecha = true;
    if (isSonidosActivos) {
        audioIniciandoReparacion.play();
    }

    intervalo = setInterval(() => {
        // Mover la línea en la dirección actual
        if (moviendoDerecha) {
            posicionLinea += velocidadLinea;
            if (posicionLinea >= 290) { // Si llega al final, cambia de dirección
                moviendoDerecha = false;
            }
        } else {
            posicionLinea -= velocidadLinea;
            if (posicionLinea <= 0) { // Si llega al inicio, cambia de dirección
                moviendoDerecha = true;
            }
        }

        // Actualizar la posición de la línea
        recargaLinea.style.left = `${posicionLinea}px`;
    }, 16); // 16ms para ~60 FPS
}

function calcularPuntuacion(posicion) {
    const centro = 150; // Centro de la barra (mitad de 300px)
    const distanciaDelCentro = Math.abs(centro - posicion);
    return Math.max(0, 100 - distanciaDelCentro); // Menor distancia, mayor puntuación
}

function detenerRecarga() {
    clearInterval(intervalo); // Detener el movimiento de la línea
    recargaBarra.style.display = "none"; // Ocultar la barra
    if (isSonidosActivos) {
        audioIniciandoReparacion.pause();
    }
    // Calcular puntuación actual
    const puntuacionActual = calcularPuntuacion(posicionLinea);
    if (puntuacionActual > 90) {
        if (isSonidosActivos) {
            audioReparacionFinalizada.play();
            setTimeout(detenerAudio, 2000);
        }
    }

    console.log(`Puntuación: ${puntuacionActual}`);

    // Sumar al puntaje total
    puntuacionTotal += puntuacionActual;

    // Actualizar el marcador
    marcador.textContent = `Puntuación: ${puntuacionTotal}`;

}

function detenerAudio() {
    audioReparacionFinalizada.pause();
}

function finalizarJuego() {
    // Mostrar el modal
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
    juegoFinalizado = true;
    controls.unlock();
    // Mostrar la puntuación final
    const finalPuntuacion = document.getElementById("final-puntuacion");
    finalPuntuacion.textContent = `Tu puntuación: ${puntuacionTotal}`;
}

function mostrarMensaje(texto) {
    const mensaje = document.getElementById("mensaje-interaccion");
    const mensajeTexto = document.getElementById("mensaje-texto");
    mensajeTexto.textContent = texto;
    mensaje.style.display = "block";
    interfazMostrada = true;
}

function ocultarMensaje() {
    const mensaje = document.getElementById("mensaje-interaccion");
    mensaje.style.display = "none";
    interfazMostrada = false;
}