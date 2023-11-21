import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default function game(settings: Object) {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(settings.color ? settings.color : 0x666666);

    // Renderer
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    // Stats
    const stats = new Stats();
    document.body.appendChild(stats.dom);
    // Camera
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-10, 10, 2);
    camera.lookAt(0, 0.5, 0);

    // Controls
    const enableControls = settings.controls !== undefined ? settings.controls : true;
    const freeFlight = settings.freeFlight !== undefined ? settings.freeFlight : false;
    let controls;
    if (enableControls) {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.listenToKeyEvents(renderer.domElement);
        controls.enableDamping = true
        controls.enablePan = true
        if (!freeFlight) {
            controls.maxPolarAngle = Math.PI / 2 - 0.05     // prevent camera below ground
            controls.minPolarAngle = Math.PI / 4            // prevent top-down view
        }
        controls.update();
    }

    // Lighting
    scene.add(new THREE.AmbientLight('white', 0.4));
    // scene.add(new THREE.HemisphereLight());

    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    const light1Direction = 35;
    light1.position.set(20, 100, 5);
    light1.castShadow = true;
    light1.shadow.camera.zoom = 2;
    light1.shadow.mapSize.width = 4096;
    light1.shadow.mapSize.height = 4096;
    light1.shadow.camera.left = -light1Direction;
    light1.shadow.camera.right = light1Direction;
    light1.shadow.camera.top = light1Direction;
    light1.shadow.camera.bottom = -light1Direction;
    scene.add(light1);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let gameLoop = (delta: DOMHighResTimeStamp) => null;
    const setGameLoop = ($gameLoop: (delta: DOMHighResTimeStamp) => null) => {
        gameLoop = $gameLoop;
    }

    const textureLoader = new THREE.TextureLoader();

    function loadTexture(path: string): THREE.Texture {
        const texture = textureLoader.load(path);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.x = 10;
        texture.repeat.y = 10;
        return texture;
    }


    function animate(delta: DOMHighResTimeStamp) {
        requestAnimationFrame(animate);

        gameLoop(delta);

        renderer.render(scene, camera);
        stats.update();

    }

    return {
        scene: scene,
        renderer: renderer,
        camera: camera,
        controls: controls,
        animate: animate,
        setGameLoop: setGameLoop,
        loadTexture: loadTexture,
    }
}