import * as THREE from "three";
import * as Framework from "../core/types";
import {Vector3} from "three";

import PlayerController from "./controller/playerController.js";
import Entity from "./entity.js";

export const GRAVITY = 50;
export const PLAYER_MAX_SPEED: number = 10;
export const PLAYER_MAX_FALL_SPEED: number = 2.5;
export const PLAYER_RUN: number = 2.5;
export const PLAYER_JUMP_FORCE: number = 120;

export default class Player extends Entity {

    constructor(
        mesh: THREE.Mesh,
        userInput: Framework.Entity.userInputInterface
    ) {
        super(mesh, userInput, undefined);
        // @ts-ignore
        this.controller = new PlayerController(this, userInput);
    }

    update(delta: DOMHighResTimeStamp) {
        this.controller.updatePosition(delta);
    }


}