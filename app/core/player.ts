import * as THREE from "three";
import {Framework} from "./types.js";

export class PlayerController {
    userInput:  Framework.Player.userInputInterface;

    constructor(userInput:  Framework.Player.userInputInterface) {
        this.userInput = userInput;
    }

    registerInput() {
        console.log(this.userInput);
    }
}

export default class Player {

    // ----------------- < PUBLIC > ----------------- \\
    mesh: THREE.Mesh;
    playerController: PlayerController;

    // ----------------- < PRIVATE > ----------------- \\

    constructor(
        mesh: THREE.Mesh,
        playerController: PlayerController
    ) {
        this.mesh = mesh;
        this.playerController = playerController;
    }

    update(timestamp: DOMHighResTimeStamp) {
        this.playerController.registerInput();

    }

}