import * as THREE from 'three';
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

// Core
import World from "./world.js";
// Components
import GroundFlat from "../components/world/GroundFlat.js";


type Nullable<T> = T | null; // check how to import this and have it globally defines as types / interfaces ???

class LibManager {
    /** @type {import * as THREE from "three";} */
    static THREE: any = THREE;
    static components: { [key : string]: any} = {
        GroundFlat: GroundFlat,
    };

    constructor() {
        throw new Error("LibManager is not instantiable!");
    }

}

class EventManager {
    // ----------------- < PUBLIC > ----------------- \\

    // ----------------- < PRIVATE > ----------------- \\
    #app: App;
    constructor(app: App) {
        this.#app = app;

        // Register Event Listeners
        window.addEventListener("resize", (event: UIEvent) => this.#_onWindowResize(event), false);

        document.addEventListener('keydown', (event: KeyboardEvent) => this.#_onKeyDown(event), false);
        document.addEventListener('keyup', (event: KeyboardEvent) => this.#_onKeyUp(event), false);

    }

    // ----------------- < EVENT METHODS > ----------------- \\
    /**
     * Resizes the Canvas and camera aspect
     * @param event
     * @private
     */
    #_onWindowResize(event: UIEvent) {
        if (this.#app.cameraMain instanceof THREE.PerspectiveCamera) {
            this.#app.cameraMain.aspect = window.innerWidth / window.innerHeight;
        }
        this.#app.cameraMain.updateProjectionMatrix();
        this.#app.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    #_onKeyDown(event: KeyboardEvent) {
        console.log(event.key);
    }

    #_onKeyUp(event: KeyboardEvent) {

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
    cameraMain: THREE.PerspectiveCamera|THREE.OrthographicCamera;
    cameras: THREE.Camera[] = [];
    controls: Nullable<OrbitControls> = null;

    // Game Loop and Game Logic
    gameLoop: (timestamp:  DOMHighResTimeStamp ) => void = (timestamp: DOMHighResTimeStamp) => { throw new Error("GameLoop not Provided"!) }; // must provide a Game loop
    timestamp: Nullable<DOMHighResTimeStamp> = null;
    timestampPrevious: Nullable<DOMHighResTimeStamp> = null;
    timestampDelta: Nullable<number> = null;                // deltatime from this.clock.getDelta()
    timestampDeltaWindow: Nullable<number> = null;          //  deltatime calcualted from the function window.requestAnimatedFrame
    // Game Components
    world: World;

    // DOM Events
    domLoaded: boolean = document.readyState === "complete"; // loaded or interactive when is not loaded or ready!
    eventManager: EventManager;
    // DOM Elements
    canvas: HTMLCanvasElement;

    // ----------------- < PRIVATE > ----------------- \\
    readonly #config: { [key: string]: any } = {} // todo make default settings;
    get config() {
        return this.#config;
    }


    constructor(config: { [key: string]: any} = {}) {
        this.#config = config;

        this.clock = new THREE.Clock();
        this.eventManager = new EventManager(this);
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
        if (controls) {
            this.controls = new OrbitControls( this.cameraMain, this.renderer.domElement );
            this.controls.keyPanSpeed = 25;
            this.controls.listenToKeyEvents( window );
            this.controls.update();
        }

        // scene
        const sceneConfigs = this.#config.scene;
        this.scene = new THREE.Scene();
        if (sceneConfigs.background) {
            this.scene.background = new THREE.Color(0x000000 );
            /*
            scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
				scene.fog = new THREE.Fog( scene.background, 1, 5000 );
             */
        }

        this.world = new World(this.scene, {...this.#config.world});


    }

    run() {
        if (!this.domLoaded) {
            window.addEventListener("load", () => {
                this.domLoaded = true;
                this.#_update();
            }, false);
        } else {
            this.#_update();
        }

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

