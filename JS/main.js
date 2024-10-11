import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

let scene, camera, renderer, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
const speed = 400.0;
const clock = new THREE.Clock();

init();
animate();

function init() {
    // Crear la escena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    // Crear la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(-59.6373025839231, 14, 20.74730299518088);
    camera.rotation.set(-0.6788501149592728, -1.5389407804029573, -0.6786021307204364)

    // Crear el renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Crear los controles de ratón (PointerLockControls)
    controls = new PointerLockControls(camera, document.body);

    // Activar los controles con un click
    document.addEventListener('click', () => {
        controls.lock();  // Bloquea el puntero
    });

    // Evento cuando se bloquea el mouse
    controls.addEventListener('lock', () => {
        console.log("Mouse locked");
    });

    // Evento cuando se desbloquea el mouse
    controls.addEventListener('unlock', () => {
        console.log("Mouse unlocked");
    });

    // Crear un plano como "suelo"
    const floorGeometry = new THREE.PlaneGeometry(500, 500);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;  // Girar para que sea horizontal
    floor.position.y = 0;  // Colocarlo en la altura 0 (suelo)
    scene.add(floor);

    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    renderer.shadowMap.enabled = true; // Habilitar sombras

    // const spotlight = new THREE.SpotLight(0xffffff, 100,40,10); // Luz direccional
    // spotlight.position.set(0,20).normalize();
    // scene.add(spotlight);
    // spotlight.position.x = 0;
    // spotlight.position.y = 10;
    // spotlight.position.z = -8;
    // const spotlighthelper = new THREE.SpotLightHelper(spotlight,10);  // El número define la longitud de los ejes
    // spotlight.add(spotlighthelper);  // Añadir el helper al cubo (o modelo)

    // Añadir modelos
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
    loadGLTFmodel(weelG1w1p, '../models/props/weel.glb', -17.8, 4.5, -.5, 8.5, 8.5, 8.5, 0,(Math.PI/2)*-1, 0, false);

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
    loadGLTFmodel(paper_tablet1, '../models/props/paper_tablet.glb', 14.6, 9.01, -38.7, 10, 10, 10, Math.PI/2*-1, 0, 0, false);

    // Evento de teclas para movimiento
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Ajustar la ventana en caso de cambio de tamaño
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
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
            console.log(camera.position);
            break;
        case 'KeyR':
            console.log(camera.rotation);
            break;
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

    if (moveForward || moveBackward) velocity.z += direction.z * speed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

    controls.object.position.addScaledVector(controls.object.getWorldDirection(new THREE.Vector3()).setY(0), velocity.z * delta);
    controls.object.position.addScaledVector(new THREE.Vector3().crossVectors(camera.up, controls.object.getWorldDirection(new THREE.Vector3())).normalize(), velocity.x * delta);

    //console.log(camera.rotation);
    //console.log(camera.position);

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