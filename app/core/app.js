//import * as THREE from '../../node_modules/three/build/three.module.js';
import * as THREE from 'three';
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

export function app(cameraSettings, withClock = false) {
    // renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // camera
    const {
        cameraType,
        fov,
        aspect,
        near,
        far
    } = cameraSettings;
    let camera;
    switch (cameraType) {
        case "perspective":
            camera = new THREE.PerspectiveCamera(
                fov,
                aspect,
                near,
                far
            );
            break;
        default:
            break;
    }

    // Set up controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.update();

    // scene
    const scene = new THREE.Scene();
    if (!withClock) {
        return [renderer, camera, scene];
    }
    return [renderer, camera, scene, new THREE.Clock()];

}