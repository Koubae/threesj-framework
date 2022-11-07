import * as THREE from 'three';
import { OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

// Core
import World from "./world.js";
import EventManager from "./eventManager.js";
// Components
import GroundFlat from "../components/world/GroundFlat.js";
import Player from "./player";


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

// x: determines the look from the player left/right shoulder (or right in center if set to 0)
// y: depends how tall is the player
// z: how far away from the player
const CAMERA_OFFSET = new THREE.Vector3(0, 5, -10);
const CAMERA_LOOKAT = new THREE.Vector3(0, 0, 50);

class ThirdPersonCamera {
    // ----------------- < PUBLIC > ----------------- \\
    camera: THREE.PerspectiveCamera|THREE.OrthographicCamera;
    target: Player
    // ----------------- < PRIVATE > ----------------- \\
    #_currentPosition: THREE.Vector3;
    #_currentLookAt: THREE.Vector3;

    constructor(camera: THREE.PerspectiveCamera|THREE.OrthographicCamera, target: Player) {
        this.camera = camera;
        this.target = target;

        this.#_currentPosition = new THREE.Vector3();
        this.#_currentLookAt = new THREE.Vector3();
    }

    #_calculateOffset() {
        const coords = CAMERA_OFFSET.clone();
        coords.applyQuaternion(this.target.mesh.quaternion);
        coords.add(this.target.mesh.position);
        return coords;
    }

    #_calculateLookAt() {
        const coords = CAMERA_LOOKAT.clone();
        coords.applyQuaternion(this.target.mesh.quaternion);
        coords.add(this.target.mesh.position);
        return coords;
    }

    update(delta: DOMHighResTimeStamp) {
        const offset = this.#_calculateOffset();
        const lookAt = this.#_calculateLookAt();

        const t = 1.0 - Math.pow(0.001, delta);

        this.#_currentPosition.lerp(offset, t);
        this.#_currentLookAt.lerp(lookAt, t);
        this.camera.position.copy(this.#_currentPosition);
        this.camera.lookAt(this.#_currentLookAt);
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
    cameraPlayer: Nullable<ThirdPersonCamera>;
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
    player: Nullable<Player>;

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
            // TODO: Improve the pan is not soo good.
            this.controls.keyPanSpeed = 100;
            this.controls.listenToKeyEvents( window );
            this.controls.update();

            // see https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_orbit.html
            this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = false;
            this.controls.minDistance = 0.1;
            this.controls.maxDistance = 1000;
            this.controls.maxPolarAngle = Math.PI / 2;

        }

        // scene
        this.scene = new THREE.Scene();
        this.world = new World(this.scene, {...this.#config.world});
        this.clock = new THREE.Clock();
        this.eventManager = new EventManager(this);

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

            if (this.controls) {
                this.controls.update();
            }

            if (this.cameraPlayer) {
                this.cameraPlayer.update(this.timestampDelta);
            }

            this.gameLoop(timestamp);


            this.renderer.render(this.scene, this.cameraMain);
            this.timestampPrevious = timestamp;

            this.#_update();
        });
    }

    addPlayer(player: Player, cameraType: string = "") {
        this.player = player;
        this.scene.add(player.mesh);
        switch (cameraType) {
            case "firstPerson":
                break;
            case "thirdPerson":
                this.cameraPlayer = new ThirdPersonCamera(this.cameraMain, player);
                break;
            default:
                break;
        }

    }



}

