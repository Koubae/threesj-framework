import * as THREE from "three";
import {Framework} from "../core/types.js";
import {Vector3} from "three";

import PlayerController from "./controller/playerController.js";

export const GRAVITY = 50;
export const PLAYER_MAX_SPEED: number = 10;
export const PLAYER_MAX_FALL_SPEED: number = 2.5;
export const PLAYER_RUN: number = 2.5;
export const PLAYER_JUMP_FORCE: number = 120;

export default class Player {

    // ----------------- < PUBLIC > ----------------- \\
    mesh: THREE.Mesh;
    playerController: PlayerController;
    rotationPan: THREE.Quaternion|null = null;
    groundCoordY: number;

    // ----------------- < PRIVATE > ----------------- \\
    #speed: Vector3 = new Vector3(10, 0.25, 25.0);
    #speedResistance: Vector3 = new Vector3(-2, -5.0, -5.0);
    #speedMin: Vector3 = new Vector3(-PLAYER_MAX_SPEED, -PLAYER_MAX_SPEED, -PLAYER_MAX_SPEED);
    #speedMax: Vector3 = new Vector3(PLAYER_MAX_SPEED, PLAYER_MAX_SPEED, PLAYER_MAX_SPEED);
    #velocity: Vector3 = new Vector3(0, 0, 0);

    get speed(): Vector3 {
        return this.#speed;
    }
    get speedResistance(): Vector3 {
        return this.#speedResistance;
    }
    get speedMin(): Vector3 {
        return this.#speedMin;
    }
    get speedMax(): Vector3 {
        return this.#speedMax;
    }
    get velocity(): Vector3 {
        return this.#velocity;
    }


    constructor(
        mesh: THREE.Mesh,
        userInput: Framework.Player.userInputInterface
    ) {
        this.mesh = mesh;
        this.playerController = new PlayerController(this, userInput);
        // Calculate the correct position of the player when it should touch the ground and place on it
        // @ts-ignore
        this.groundCoordY = this.mesh.geometry.parameters.width / 2;
        this.mesh.position.y = this.groundCoordY; // put the cube on top of ground (y=0)
    }

    update(delta: DOMHighResTimeStamp) {
        this.playerController.updatePosition(delta);
    }


}