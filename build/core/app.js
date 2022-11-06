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
var _App_instances, _App_config, _App__update;
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
export default class App {
    constructor(config = {}) {
        _App_instances.add(this);
        this.cameras = [];
        this.controls = null;
        // Game Loop and Game Logic
        this.gameLoop = (timestamp) => { throw new Error("GameLoop not Provided"); }; // must provide a Game loop
        this.timestamp = null;
        this.timestampPrevious = null;
        this.timestampDelta = null; // deltatime from this.clock.getDelta()
        this.timestampDeltaWindow = null; //  deltatime calcualted from the function window.requestAnimatedFrame
        // ----------------- < PRIVATE > ----------------- \\
        _App_config.set(this, {}); // todo make default settings;
        __classPrivateFieldSet(this, _App_config, config, "f");
        // create renderer
        const rendererSettings = __classPrivateFieldGet(this, _App_config, "f").renderer;
        this.renderer = new THREE.WebGLRenderer({
            antialias: rendererSettings.antialias,
        });
        this.renderer.outputEncoding = rendererSettings.encoding === 'rgb' ? THREE.sRGBEncoding : THREE.LinearEncoding;
        this.renderer.shadowMap.enabled = rendererSettings.shadowMap;
        this.renderer.shadowMap.type = rendererSettings.shadowMapType === "soft" ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.canvas = this.renderer.domElement;
        document.body.appendChild(this.canvas);
        // Create App camera
        const { cameraType, fov, aspect, near, far, controls } = __classPrivateFieldGet(this, _App_config, "f").cameraSettings;
        switch (cameraType) {
            case "perspective":
                this.cameraMain = new THREE.PerspectiveCamera(fov, aspect, near, far);
                break;
            default:
                this.cameraMain = new THREE.PerspectiveCamera(fov, aspect, near, far);
                break;
        }
        this.cameras.push(this.cameraMain);
        // Set up controls
        if (this.controls) {
            this.controls = new OrbitControls(this.cameraMain, this.renderer.domElement);
            this.controls.update();
        }
        // scene
        const sceneConfigs = __classPrivateFieldGet(this, _App_config, "f").scene;
        this.scene = new THREE.Scene();
        if (sceneConfigs.background) {
            this.scene.background = new THREE.Color(0x000000);
        }
        this.clock = new THREE.Clock();
        console.log(sceneConfigs.background);
    }
    get config() {
        return __classPrivateFieldGet(this, _App_config, "f");
    }
    run() {
        window.addEventListener("DOMContentLoaded", () => {
            __classPrivateFieldGet(this, _App_instances, "m", _App__update).call(this);
        });
    }
}
_App_config = new WeakMap(), _App_instances = new WeakSet(), _App__update = function _App__update() {
    window.requestAnimationFrame((timestamp) => {
        this.timestamp = timestamp;
        if (this.timestampPrevious === null || this.timestampPrevious === undefined) {
            this.timestampPrevious = timestamp;
        }
        this.timestampDelta = this.clock.getDelta();
        this.timestampDeltaWindow = (this.timestamp - this.timestampPrevious) / 1000;
        this.gameLoop(timestamp);
        this.renderer.render(this.scene, this.cameraMain);
        this.timestampPrevious = timestamp;
        __classPrivateFieldGet(this, _App_instances, "m", _App__update).call(this);
    });
};
