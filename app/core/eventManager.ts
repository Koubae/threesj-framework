import * as THREE from "three";
import App from "./app";
import {Framework} from "./types.js";

export default class EventManager {
    // ----------------- < PUBLIC > ----------------- \\
    public userInput: Framework.Player.userInputInterface = { // TODO : Make interface and make it global
        allKeyPressed: [],
        keyDownCurrent: null,
        keyDownPrevious: null,

        keyUpCurrent: null,
        keyUpPrevious: null,
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
        const key = event.key.toLowerCase();
        if (this.userInput.keyDownCurrent && this.userInput.keyDownCurrent !== key) {
            this.userInput.keyDownPrevious = this.userInput.keyDownCurrent;
        }
        this.userInput.keyDownCurrent = key;
        if (!this.userInput.allKeyPressed.includes(key)) {
            this.userInput.allKeyPressed.push(key);
        }

    }

    #_onKeyUp(event: KeyboardEvent) {
        const key = event.key.toLowerCase();
        if (this.userInput.keyUpCurrent) {
            this.userInput.keyUpPrevious = this.userInput.keyUpCurrent;
        }
        // remove the key-up event
        if (this.userInput.keyDownCurrent === key) {
            this.userInput.keyDownCurrent = null;
        }
        if (this.userInput.keyDownPrevious === key) {
            this.userInput.keyDownPrevious = null;
        }

        this.userInput.keyUpCurrent = key;
        // remove key
        let index = this.userInput.allKeyPressed.indexOf(key);
        if (index > -1) {
            this.userInput.allKeyPressed.splice(index, 1);
        }
    }
}
