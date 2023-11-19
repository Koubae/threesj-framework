/**
 * @credits:
 *  - https://threejs.org/examples/webgl_geometry_terrain.html
 *  - https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain.html
 */

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';

import {FirstPersonControls} from 'three/examples/jsm/controls/FirstPersonControls.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {ImprovedNoise} from 'three/examples/jsm/math/ImprovedNoise.js';

export default function demo() {
    let container, stats;
    let camera, controls, scene, renderer, map;
    let mesh, texture;

    const worldWidth = 256, worldDepth = 256;
    const clock = new THREE.Clock();
    const ADD_FOG = false;
    const ORBIT_CONTROL = true;
    const ROTATE_MAP = false;
    const RANDOM_SEED = false;

    const randBrowser = Math.random; // Keep reference of original function, below we overwriting it
    const randNumber = (min, max) => randBrowser() * (max - min) + min;

    init();
    animate();

    function createMap(scene) {
        const data = generateHeight(worldWidth, worldDepth);
        const geometry = new THREE.PlaneGeometry(7500, 7500, worldWidth - 1, worldDepth - 1);
        geometry.rotateX(-Math.PI / 2);

        const vertices = geometry.attributes.position.array;
        const intensity = 10; // QST? I call it intensity because mountain become higher but not sure,.

        for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            vertices[j + 1] = data[i] * intensity;
        }

        texture = new THREE.CanvasTexture(generateTexture(data, worldWidth, worldDepth));
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.colorSpace = THREE.SRGBColorSpace;

        mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({map: texture}));
        scene.add(mesh);
        return mesh;
    }

    function generateTexture(data, width, height) {

        let context, image, imageData, shade;

        const vector3 = new THREE.Vector3(0, 0, 0);

        const sun = new THREE.Vector3(1, 1, 1);
        sun.normalize();

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        context = canvas.getContext('2d');
        context.fillStyle = '#000';
        context.fillRect(0, 0, width, height);

        image = context.getImageData(0, 0, canvas.width, canvas.height);
        imageData = image.data;

        for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {

            vector3.x = data[j - 2] - data[j + 2];
            vector3.y = 2;
            vector3.z = data[j - width * 2] - data[j + width * 2];
            vector3.normalize();

            shade = vector3.dot(sun);

            imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
            imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
            imageData[i + 2] = (shade * 96) * (0.5 + data[j] * 0.007);

        }

        context.putImageData(image, 0, 0);

        // Scaled 4x

        const canvasScaled = document.createElement('canvas');
        canvasScaled.width = width * 4;
        canvasScaled.height = height * 4;

        context = canvasScaled.getContext('2d');
        context.scale(4, 4);
        context.drawImage(canvas, 0, 0);

        image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
        imageData = image.data;

        for (let i = 0, l = imageData.length; i < l; i += 4) {

            const v = ~~(Math.random() * 5);

            imageData[i] += v;
            imageData[i + 1] += v;
            imageData[i + 2] += v;

        }

        context.putImageData(image, 0, 0);

        return canvasScaled;

    }

    function init() {
        container = document.createElement("div");
        container.setAttribute("id", "container");
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000);

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xefd1b5);
        if (ADD_FOG) {
            scene.fog = new THREE.FogExp2(0xefd1b5, 0.0025);
            camera.position.set(100, 800, -800);
            camera.lookAt(-100, 810, -800);
        } else {
            camera.position.set(3500, 3200, -2800);
            camera.lookAt(-100, 810, -800);
        }

        map = createMap(scene);

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // Controls
        if (ORBIT_CONTROL) {
            controls = new OrbitControls(camera, renderer.domElement);
            controls.listenToKeyEvents(container);
        } else {
            controls = new FirstPersonControls(camera, renderer.domElement);
            controls.movementSpeed = 150;
            controls.lookSpeed = 0.1;
        }

        stats = new Stats();
        container.appendChild(stats.dom);

        // Lights
        scene.add(new THREE.AmbientLight(0x404040, 0.5));

        let sunLight= new THREE.DirectionalLight(0xFFFFFF, 8.0);
        sunLight.position.set(200, 3000, 6000);
        sunLight.target.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.bias = -0.001;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 3500.0;
        sunLight.shadow.camera.left = 100;
        sunLight.shadow.camera.right = -100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        scene.add(sunLight)
        scene.add(new THREE.DirectionalLightHelper( sunLight, 100 ));


        window.addEventListener('resize', onWindowResize);

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        if (!ORBIT_CONTROL) controls.handleResize();

    }

    function generateHeight(width, height) {

        let seed = Math.PI / 4;
        if (RANDOM_SEED) seed = randNumber(0.001, 1000);

        window.Math.random = function () {

            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);

        };

        const size = width * height
        const data = new Uint8Array(size);
        const perlin = new ImprovedNoise()
        const z = Math.random() * 100;

        let quality = 1;

        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < size; i++) {
                const x = i % width
                const y = ~~(i / width); // What is the "double tilde" (~~) operator in JavaScript?  https://stackoverflow.com/questions/5971645/what-is-the-double-tilde-operator-in-javascript
                data[i] += Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75);
            }
            quality *= 5;

        }
        return data;

    }

    function animate() {
        requestAnimationFrame(animate);

        if (ROTATE_MAP) {
            const delta = clock.getDelta();
            let rotation = ((-Math.PI / 2) * delta);
            map.geometry.rotateY(rotation);
        }


        render();
        stats.update();

    }


    function render() {

        controls.update(clock.getDelta());
        renderer.render(scene, camera);

    }

}