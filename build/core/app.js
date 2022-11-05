var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _App_instances, _App_config, _App__init;
import * as THREE from 'three';
export default class App {
    constructor(config) {
        _App_instances.add(this);
        // props public
        this.renderer = null;
        this.stage = null;
        this.cameras = [];
        // props private
        _App_config.set(this, {}); // todo make default settings;
        __classPrivateFieldSet(this, _App_config, config, "f");
        __classPrivateFieldGet(this, _App_instances, "m", _App__init).call(this);
    }
}
_App_config = new WeakMap(), _App_instances = new WeakSet(), _App__init = function _App__init() {
    // create renderer
    this.renderer = new THREE.WebGLRenderer();
    //this.renderer.set
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
};
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
