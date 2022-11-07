import * as THREE from "three";
import App from "./app";
import {Framework} from "./types.js";

export default class EventManager {
    // ----------------- < PUBLIC > ----------------- \\
    public userInput: Framework.Player.userInputInterface = { // TODO : Make interface and make it global
        keyUpCurrent: null,
        keyUpPrevious: null,

        keyDownCurrent: null,
        keyDownPrevious: null,
    }

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
        if (this.userInput.keyUpCurrent) {
            this.userInput.keyUpPrevious = this.userInput.keyUpCurrent;
        }
        // remove the key-up event
        if (this.userInput.keyDownCurrent === event.key) {
            this.userInput.keyDownPrevious = this.userInput.keyDownCurrent;
            this.userInput.keyDownCurrent = null;
        }

        this.userInput.keyUpCurrent = event.key;
    }

    #_onKeyUp(event: KeyboardEvent) {
        if (this.userInput.keyDownCurrent) {
            this.userInput.keyDownPrevious = this.userInput.keyDownCurrent;
        }
        // remove the key-up event
        if (this.userInput.keyUpCurrent === event.key) {
            this.userInput.keyUpPrevious = this.userInput.keyUpCurrent;
            this.userInput.keyUpCurrent = null;
        }

        this.userInput.keyDownCurrent = event.key;
    }
}
