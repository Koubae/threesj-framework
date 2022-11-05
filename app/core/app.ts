import * as THREE from 'three';
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {WebGLRenderer} from "three/src/renderers/WebGLRenderer";

type Nullable<T> = T | null; // check how to import this

export default class App {

    // props public
    renderer: Nullable<WebGLRenderer> = null;
    stage = null;
    cameras = [];

    // props private
    #config = {} // todo make default settings;


    constructor(config: Object) {
        this.#config = config;
        this.#_init();
    }

    #_init() {
        // create renderer
        this.renderer = new THREE.WebGLRenderer();
        //this.renderer.set
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );
    }


}
/*

export function App1(cameraSettings, withClock = false) {
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

}*/
