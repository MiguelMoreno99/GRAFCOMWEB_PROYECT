import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
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

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBkWltPwV8BQJ5hgV8laGcir6yXC-J-PhM",
    authDomain: "coordenadas2-2deae.firebaseapp.com",
    databaseURL: "https://coordenadas2-2deae-default-rtdb.firebaseio.com",
    projectId: "coordenadas2-2deae",
    storageBucket: "coordenadas2-2deae.firebasestorage.app",
    messagingSenderId: "57386903690",
    appId: "1:57386903690:web:2ffb323eeb5e86e7e12573"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth();
const db = getDatabase();

const buttonLogin = document.getElementById("button-login");
const buttonLogout = document.getElementById("button-logout");

let currentUser;
async function login() {
    await signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            currentUser = result.user;
            writeUserData(currentUser.uid, 0, 0);
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
}

buttonLogin.addEventListener("click", async () => {
    await login();
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
const starCountRef = ref(db, "jugadores");
onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
    Object.entries(data).forEach(([key, value]) => {
        console.log(`${key} ${value.x} ${value.z}`);

        const jugador = scene.getObjectByName(key);

        if (!jugador) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshPhongMaterial();
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.position.set(value.x, 10, value.z);
            mesh.material.color = new THREE.Color(Math.random() * 0xffffff);
            mesh.name = key;
            scene.add(mesh);
        }

        scene.getObjectByName(key).position.x = value.x;
        scene.getObjectByName(key).position.z = value.z;
    });
});

//Leer
function writeUserData(userId, positionX, positionZ) {
    set(ref(db, "jugadores/" + userId), {
        x: positionX,
        z: positionZ,
    });
}
let jugadorActual = null;

// Obtener el escenario de la URL
const params = new URLSearchParams(window.location.search);
const escenario = params.get('escenario');
const btnReanudar = document.getElementById("btn-reanudar");
const toggleMusica = document.getElementById('activar-musica');
const toggleSonidos = document.getElementById('activar-efectos');

const speed = 400.0;
const clock = new THREE.Clock();

// Cajas de colisión
const objetosConColision = []; // Array para almacenar los objetos que tienen colisión
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

init();
animate();

function init() {
    alert("Para inicar el juego presiona la tecla ENTER");

    // Crear la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);
    // Crear la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-38.81985205000609, 14, 12.411578414885154);
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

    // Crear las paredes con colisión
    const pared1 = loadBoxColition(130, 35, 8, 0, 15, -40, showColitions);
    const pared2 = loadBoxColition(130, 35, 8, 0, 15, 107, showColitions);
    const pared3 = loadBoxColition(8, 35, 150, -60, 15, 30, showColitions);
    const pared4 = loadBoxColition(8, 35, 150, 60, 15, 30, showColitions);
    const carro1 = loadBoxColition(38, 35, 15, -31, 15, -7, showColitions);
    const carro2 = loadBoxColition(38, 35, 15, 29, 15, 74, showColitions);

    scene.add(jugadorHelper);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    if (mouseLocked) {

        jugadorActual = scene.getObjectByName(currentUser.uid);

        switch (event.code) {
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
                    //audioJuego.play();
                }
                if (!gameStarted) {
                    startCountdown(180, () => {
                        console.log("¡Tiempo terminado!");
                        // Aquí puedes agregar lógica adicional si es necesario
                    });
                    gameStarted = true
                }
                break;
        }

        writeUserData(
            currentUser.uid,
            jugadorActual.position.x,
            jugadorActual.position.z
        );

    } else {
        switch (event.code) {
            case 'Enter':
                if (!gamePaused) {
                    controls.lock();  // Bloquea el puntero
                    mouseLocked = true;
                    //audioJuego.play();
                }
                if (!gameStarted) {
                    startCountdown(180, () => {
                        console.log("¡Tiempo terminado!");
                        // Aquí puedes agregar lógica adicional si es necesario
                    });
                    gameStarted = true
                }
                break;
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

    // Comprobar si la posición ha cambiado
    if (!prevPosition.equals(controls.object.position)) {
        console.log("La posición de la cámara ha cambiado:", controls.object.position);
        jugadorActual.position.x = controls.object.position.x;
        jugadorActual.position.z = controls.object.position.z;
    }

    // Actualizar la caja del jugador
    jugadorBox.setFromCenterAndSize(
        controls.object.position,
        new THREE.Vector3(1, 1, 1) // Tamaño del jugador (puedes ajustar esto)
    );

    // Comprobar colisiones
    for (const objetoBox of objetosConColision) {
        if (jugadorBox.intersectsBox(objetoBox)) {
            // Si hay colisión, revertir a la posición anterior
            controls.object.position.copy(prevPosition);
            break; // Salir del bucle al detectar colisión
        }
    }

    renderer.render(scene, camera);
}

function loadGLTFmodel(modelname, path, posx, posy, posz, scalex, scaley, scalez, rotx, roty, rotz, helper) {
    // Cargar un modelo GLTF
    modelname = new GLTFLoader();
    modelname.load(path, (gltf) => {
        const model = gltf.scene;
        model.position.set(posx, posy, posz);  // Posición del modelo en la escena
        model.scale.set(scalex, scaley, scalez);  // Ajustar la escala si es necesario
        model.rotation.set(rotx, roty, rotz);
        scene.add(model);

        if (helper) {
            // Crear y añadir un AxesHelper para visualizar el pivote
            const axesHelper = new THREE.AxesHelper(30);  // El número define la longitud de los ejes
            model.add(axesHelper);  // Añadir el helper al cubo (o modelo)
        }
    }, undefined, (error) => {
        console.error('Error al cargar el modelo', error);
    });
}

function loadOBJyMTLmodel(objname, pathfolder, nameAmtl, nameAobj, posx, posy, posz, scalex, scaley, scalez, rotx, roty, rotz, helper) {
    // Cargar el archivo MTL que contiene los materiales
    const mlt = new MTLLoader();
    mlt.setPath(pathfolder);  // Ruta donde se encuentran los archivos './models/weel/'
    mlt.load(nameAmtl, (materials) => { // nombre del archito .mtl 'model.mtl'
        materials.preload();  // Precargar los materiales

        // Cargar el modelo OBJ con los materiales aplicados
        objname = new OBJLoader();
        objname.setMaterials(materials);
        objname.setPath(pathfolder);  // Ruta donde se encuentran los archivos
        objname.load(nameAobj, (obj) => { // nombre del archito .obj 'model.obj'
            const model = obj;
            model.scale.set(scalex, scaley, scalez);  // Ajustar la escala si es necesario
            model.position.set(posx, posy, posz);
            model.rotation.set(rotx, roty, rotz);
            scene.add(model);

            if (helper) {
                // Crear y añadir un AxesHelper para visualizar el pivote
                const axesHelper = new THREE.AxesHelper(30);  // El número define la longitud de los ejes
                model.add(axesHelper);  // Añadir el helper al cubo (o modelo)
            }
        });
    });
}

function loadLvL1Models() {

    //Añadir modelos
    const garage1 = null;
    loadGLTFmodel(garage1, '../models/garage4/scene.gltf', 0, -3, 0, 1, 1, 1, 0, 0, 0, false);

    const cealingG1_1 = null;
    loadGLTFmodel(cealingG1_1, '../models/fake_drop_ceiling/scene.gltf', 39, 31, -24, 20, 1, 20, 0, 0, 0, false);

    const cealingG1_2 = null;
    loadGLTFmodel(cealingG1_2, '../models/fake_drop_ceiling/scene.gltf', -1, 31, -24, 20, 1, 20, 0, 0, 0, false);

    const cealingG1_3 = null;
    loadGLTFmodel(cealingG1_3, '../models/fake_drop_ceiling/scene.gltf', -41.5, 31, -24, 20.5, 1, 20, 0, 0, 0, false);

    const cealingG1_4 = null;
    loadGLTFmodel(cealingG1_4, '../models/fake_drop_ceiling/scene.gltf', -41.5, 31, 14.5, 20.5, 1, 18.5, 0, 0, 0, false);

    const cealingG1_5 = null;
    loadGLTFmodel(cealingG1_5, '../models/fake_drop_ceiling/scene.gltf', -1, 31, 14.5, 20, 1, 18.5, 0, 0, 0, false);

    const cealingG1_6 = null;
    loadGLTFmodel(cealingG1_6, '../models/fake_drop_ceiling/scene.gltf', 39, 31, 14.5, 20, 1, 18.5, 0, 0, 0, false);

    const garage2 = null;
    loadGLTFmodel(garage2, '../models/garage4/scene.gltf', -3, -3, 65.85, 1, 1, 1, 0, Math.PI, 0, false);

    let val = 77;

    const cealingG2_1 = null;
    loadGLTFmodel(cealingG2_1, '../models/fake_drop_ceiling/scene.gltf', 39, 31, -24 + val, 20, 1, 20, 0, 0, 0, false);

    const cealingG2_2 = null;
    loadGLTFmodel(cealingG2_2, '../models/fake_drop_ceiling/scene.gltf', -1, 31, -24 + val, 20, 1, 20, 0, 0, 0, false);

    const cealingG2_3 = null;
    loadGLTFmodel(cealingG2_3, '../models/fake_drop_ceiling/scene.gltf', -41.5, 31, -24 + val, 20.5, 1, 20, 0, 0, 0, false);

    const cealingG2_4 = null;
    loadGLTFmodel(cealingG2_4, '../models/fake_drop_ceiling/scene.gltf', -41.5, 31, 14.5 + val, 20.5, 1, 18.5, 0, 0, 0, false);

    const cealingG2_5 = null;
    loadGLTFmodel(cealingG2_5, '../models/fake_drop_ceiling/scene.gltf', -1, 31, 14.5 + val, 20, 1, 18.5, 0, 0, 0, false);

    const cealingG2_6 = null;
    loadGLTFmodel(cealingG2_6, '../models/fake_drop_ceiling/scene.gltf', 39, 31, 14.5 + val, 20, 1, 18.5, 0, 0, 0, false);

    const weelG1w1p = null;
    loadGLTFmodel(weelG1w1p, '../models/props/weel.glb', -17.8, 4.5, -.5, 8.5, 8.5, 8.5, 0, (Math.PI / 2) * -1, 0, false);

    const weelG1w1 = null;
    loadGLTFmodel(weelG1w1, '../models/props/weel.glb', 43, 3.2, -16.5, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);

    const weelG1w2 = null;
    loadGLTFmodel(weelG1w2, '../models/props/weel.glb', 43, 3.2, -25, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);

    const weelG1w3 = null;
    loadGLTFmodel(weelG1w3, '../models/props/weel.glb', 43, 10, -16.5, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);

    const weelG1w4 = null;
    loadGLTFmodel(weelG1w4, '../models/props/weel.glb', 43, 10, -25, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);

    const weel_wrench1 = null;
    loadGLTFmodel(weel_wrench1, '../models/props/weel_wrench.glb', -18, 9, -40, 18, 18, 18, 0, 0, 0, false);

    const extinguisher1 = null;
    loadGLTFmodel(extinguisher1, '../models/props/extinguisher.glb', 36, 3.5, -43.1, .11, .11, .11, 0, 0, 0, false);

    const gasoline1 = null;
    loadGLTFmodel(gasoline1, '../models/props/gasoline.glb', 54, 10.2, 20, 15, 15, 15, 0, 0, 0, false);

    const engine1 = null;
    loadGLTFmodel(engine1, '../models/props/engine3.glb', 42, 4.6, -6, .4, .4, .4, 0, 0, 0, false);

    const impact_wrench1 = null;
    loadGLTFmodel(impact_wrench1, '../models/props/impact_wrench.glb', -53, 7.6, 11, 10, 10, 10, 0, 0, 0, false);

    const paper_tablet1 = null;
    loadGLTFmodel(paper_tablet1, '../models/props/paper_tablet.glb', 14.6, 9.01, -38.7, 10, 10, 10, Math.PI / 2 * -1, 0, 0, false);
}

function loadLvL2Models() {

    const garage3 = null;
    loadGLTFmodel(garage3, '../models/garage5/scene.gltf', 0, 0, 0, 10, 10, 10, 0, 0, 0, false);

    const garage3_2 = null;
    loadGLTFmodel(garage3_2, '../models/garage5/scene.gltf', -1, 0, 147.8, 10, 10, 10, 0, Math.PI, 0, false);

    const wall1 = null;
    loadGLTFmodel(wall1, '../models/props/wall.glb', -60, -1, 80, 30, 30, 30, 0, Math.PI / 2, 0, false);

    const wall2 = null;
    loadGLTFmodel(wall2, '../models/props/wall.glb', 60, -1, 70, 30, 30, 30, 0, Math.PI / 2 * -1, 0, false);

    const wall3 = null;
    loadGLTFmodel(wall3, '../models/props/wall.glb', 0, -1, -37, 20, 30, 30, 0, 0, 0, false);

    const wall4 = null;
    loadGLTFmodel(wall4, '../models/props/wall.glb', 0, -1, 197, 20, 30, 30, 0, 0, 0, false);

    const weelG1w1 = null;
    loadGLTFmodel(weelG1w1, '../models/props/weel.glb', 43, 3.2, -16.5, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);

    const weelG1w2 = null;
    loadGLTFmodel(weelG1w2, '../models/props/weel.glb', 43, 3.2, -25, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);

    const weelG1w3 = null;
    loadGLTFmodel(weelG1w3, '../models/props/weel.glb', 43, 10, -16.5, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);

    const weelG1w4 = null;
    loadGLTFmodel(weelG1w4, '../models/props/weel.glb', 43, 10, -25, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);

    const weel_wrench1 = null;
    loadGLTFmodel(weel_wrench1, '../models/props/weel_wrench.glb', -18, 9, -40, 18, 18, 18, 0, 0, 0, false);

    const extinguisher1 = null;
    loadGLTFmodel(extinguisher1, '../models/props/extinguisher.glb', 36, 3.5, -43.1, .11, .11, .11, 0, 0, 0, false);

    const gasoline1 = null;
    loadGLTFmodel(gasoline1, '../models/props/gasoline.glb', 54, 10.2, 20, 15, 15, 15, 0, 0, 0, false);

    const engine1 = null;
    loadGLTFmodel(engine1, '../models/props/engine3.glb', 42, 4.6, -6, .4, .4, .4, 0, 0, 0, false);

    const impact_wrench1 = null;
    loadGLTFmodel(impact_wrench1, '../models/props/impact_wrench.glb', -53, 7.6, 11, 10, 10, 10, 0, 0, 0, false);

    const paper_tablet1 = null;
    loadGLTFmodel(paper_tablet1, '../models/props/paper_tablet.glb', 14.6, 9.01, -38.7, 10, 10, 10, Math.PI / 2 * -1, 0, 0, false);

    const car1 = null;
    loadGLTFmodel(car1, '../models/props/car5.glb', 0, 5, 0, 18, 18, 18, 0, 0, 0, false);

    const car2 = null;
    loadGLTFmodel(car2, '../models/props/car5.glb', 30, 5, 0, 18, 18, 18, 0, 0, 0, false);

}

function loadLvL3Models() {

    const garage2 = null;
    loadGLTFmodel(garage2, '../models/underground_parking/scene.gltf', 0, .1, 0, 12, 12, 12, 0, 0, 0, false);

    const weelG1w1 = null;
    loadGLTFmodel(weelG1w1, '../models/props/weel.glb', 43, 3.2, -16.5, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);

    const weelG1w2 = null;
    loadGLTFmodel(weelG1w2, '../models/props/weel.glb', 43, 3.2, -25, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);

    const weelG1w3 = null;
    loadGLTFmodel(weelG1w3, '../models/props/weel.glb', 43, 10, -16.5, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);

    const weelG1w4 = null;
    loadGLTFmodel(weelG1w4, '../models/props/weel.glb', 43, 10, -25, 8.5, 8.5, 8.5, 0, Math.PI, 0, false);

    const weel_wrench1 = null;
    loadGLTFmodel(weel_wrench1, '../models/props/weel_wrench.glb', -18, 9, -40, 18, 18, 18, 0, 0, 0, false);

    const extinguisher1 = null;
    loadGLTFmodel(extinguisher1, '../models/props/extinguisher.glb', 36, 3.5, -43.1, .11, .11, .11, 0, 0, 0, false);

    const gasoline1 = null;
    loadGLTFmodel(gasoline1, '../models/props/gasoline.glb', 54, 10.2, 20, 15, 15, 15, 0, 0, 0, false);

    const engine1 = null;
    loadGLTFmodel(engine1, '../models/props/engine3.glb', 42, 4.6, -6, .4, .4, .4, 0, 0, 0, false);

    const impact_wrench1 = null;
    loadGLTFmodel(impact_wrench1, '../models/props/impact_wrench.glb', -53, 7.6, 11, 10, 10, 10, 0, 0, 0, false);

    const paper_tablet1 = null;
    loadGLTFmodel(paper_tablet1, '../models/props/paper_tablet.glb', 14.6, 9.01, -38.7, 10, 10, 10, Math.PI / 2 * -1, 0, 0, false);

    const car1 = null;
    loadGLTFmodel(car1, '../models/props/car5.glb', 0, 5, 0, 18, 18, 18, 0, 0, 0, false);

    const car2 = null;
    loadGLTFmodel(car2, '../models/props/car5.glb', 30, 5, 0, 18, 18, 18, 0, 0, 0, false);

}

function loadAudio() {
    //Audio del juego
    audioLoader.load('../AUDIO/Spark_Elwood.mp3', function (buffer) {
        audioJuego.setBuffer(buffer);
        audioJuego.setLoop(true);
        audioJuego.setVolume(0.01); // ajustar el volumen (de 0 a 1)
        audioJuego.play();
        audioJuego.pause();
    });

    //Audio de efecto
    audioLoader.load('../AUDIO/iniciandoReparacion.mp3', function (buffer) {
        audioIniciandoReparacion.setBuffer(buffer);
        audioIniciandoReparacion.setLoop(true);
        audioIniciandoReparacion.setVolume(0.06); // ajustar el volumen (de 0 a 1)
        audioIniciandoReparacion.play();
        audioIniciandoReparacion.pause();
    });

    //Audio de efecto
    audioLoader.load('../AUDIO/reparacionExitosa.mp3', function (buffer) {
        audioReparacionFinalizada.setBuffer(buffer);
        audioReparacionFinalizada.setLoop(true);
        audioReparacionFinalizada.setVolume(0.06); // ajustar el volumen (de 0 a 1)
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
            audioIniciandoReparacion.play();
            audioReparacionFinalizada.play();
        } else {
            audioReparacionFinalizada.pause();
            audioIniciandoReparacion.pause();
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
}

function loadScene() {
    // Determinar qué escenario cargar
    if (escenario === 'escenario1') {
        loadLvL1Models();
    } else if (escenario === 'escenario2') {
        loadLvL2Models();
    } else if (escenario === 'escenario3') {
        loadLvL3Models();
    } else {
        // Mostrar un mensaje al usuario y redirigirlo al menú principal
        alert("Escenario no válido. Regresando al menú principal...");
        window.location.href = 'menu_principal.html'; // Cambia "menu.html" al nombre correcto de tu menú principal
    }
}

function loadBoxColition(x, y, z, posx, posy, posz, visible = false) {
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

    // Agregar a los objetos con colisión
    objetosConColision.push(box);

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


