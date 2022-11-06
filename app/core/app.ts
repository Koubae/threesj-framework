import * as THREE from 'three';
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {Camera} from "three/src/cameras/Camera";

type Nullable<T> = T | null; // check how to import this and have it globally defines as types / interfaces ???

class LibManager {

    static THREE: any = THREE;

    constructor() {
        throw new Error("LibManager is not instantiable!");
    }

}

export default class App {

    // ----------------- < PUBLIC > ----------------- \\
    // library
    static lib: LibManager = LibManager;

    // Structure
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    clock: THREE.Clock;
    cameraMain: THREE.Camera;
    cameras: THREE.Camera[] = [];
    controls: Nullable<OrbitControls> = null;

    // Game Loop and Game Logic
    gameLoop: (timestamp:  DOMHighResTimeStamp ) => void = (timestamp: DOMHighResTimeStamp) => { throw new Error("GameLoop not Provided"!) }; // must provide a Game loop
    timestamp: Nullable<DOMHighResTimeStamp> = null;
    timestampPrevious: Nullable<DOMHighResTimeStamp> = null;
    timestampDelta: Nullable<number> = null;                // deltatime from this.clock.getDelta()
    timestampDeltaWindow: Nullable<number> = null;          //  deltatime calcualted from the function window.requestAnimatedFrame

    // DOM Elements
    canvas: HTMLCanvasElement;

    // ----------------- < PRIVATE > ----------------- \\
    readonly #config: { [key: string]: any } = {} // todo make default settings;
    get config() {
        return this.#config;
    }


    constructor(config: { [key: string]: any} = {}) {
        this.#config = config;
        // create renderer
        const rendererSettings = this.#config.renderer;
        this.renderer = new THREE.WebGLRenderer({
            antialias: rendererSettings.antialias,
        });
        this.renderer.outputEncoding = rendererSettings.encoding === 'rgb' ? THREE.sRGBEncoding : THREE.LinearEncoding;
        this.renderer.shadowMap.enabled = rendererSettings.shadowMap;
        this.renderer.shadowMap.type = rendererSettings.shadowMapType === "soft" ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.canvas = this.renderer.domElement;
        document.body.appendChild( this.canvas );

        // Create App camera
        const {
            cameraType,
            fov,
            aspect,
            near,
            far,
            controls
        } = this.#config.cameraSettings;
        switch (cameraType) {
            case "perspective":
                this.cameraMain = new THREE.PerspectiveCamera(
                    fov,
                    aspect,
                    near,
                    far
                );
                break;
            default:
                this.cameraMain = new THREE.PerspectiveCamera(
                    fov,
                    aspect,
                    near,
                    far
                );
                break;
        }
        this.cameras.push(this.cameraMain);

        // Set up controls
        if (this.controls) {
            this.controls = new OrbitControls( this.cameraMain, this.renderer.domElement );
            this.controls.update();
        }

        // scene
        const sceneConfigs = this.#config.scene;
        this.scene = new THREE.Scene();
        if (sceneConfigs.background) {
            this.scene.background = new THREE.Color(0x000000 );
        }

        this.clock = new THREE.Clock();
        console.log(sceneConfigs.background);


    }

    run() {
        window.addEventListener("DOMContentLoaded", () => {
            this.#_update();
        });
    }

    #_update() {
        window.requestAnimationFrame((timestamp:  DOMHighResTimeStamp ) => {
            this.timestamp = timestamp;
            if (this.timestampPrevious === null || this.timestampPrevious === undefined) {
                this.timestampPrevious = timestamp;
            }
            this.timestampDelta = this.clock.getDelta();
            this.timestampDeltaWindow =  (this.timestamp - this.timestampPrevious) / 1000;


            this.gameLoop(timestamp);


            this.renderer.render(this.scene, this.cameraMain);
            this.timestampPrevious = timestamp;

            this.#_update();
        });
    }



}

