import * as THREE from "three";
import * as Framework from "../core/types";
import {Vector3} from "three";

// import PlayerController from "./controller/playerController.js";
import EntityInterface = Framework.Entity.EntityInterface;

import EntityController, {EntityControllerInterface} from "./controller/entityController.js";

export const GRAVITY = 50;
export const ENTITY_MAX_SPEED: number = 10;
export const ENTITY_MAX_FALL_SPEED: number = 2.5;
export const ENTITY_RUN: number = 2.5;
export const ENTITY_JUMP_FORCE: number = 120;



export default class Entity implements EntityInterface {

    // ----------------- < PUBLIC > ----------------- \\
    mesh: THREE.Mesh;
    controller: typeof EntityControllerInterface;
    rotationPan: THREE.Quaternion|null = null;
    groundCoordY: number;

    // ----------------- < PRIVATE > ----------------- \\
    protected _speed: Vector3 = new Vector3(10, 0.25, 25.0);
    protected _speedResistance: Vector3 = new Vector3(-2, -5.0, -5.0);
    protected _speedMin: Vector3 = new Vector3(-ENTITY_MAX_SPEED, -ENTITY_MAX_SPEED, -ENTITY_MAX_SPEED);
    protected _speedMax: Vector3 = new Vector3(ENTITY_MAX_SPEED, ENTITY_MAX_SPEED, ENTITY_MAX_SPEED);
    protected _velocity: Vector3 = new Vector3(0, 0, 0);

    public get speed() {
        return this._speed;
    }
    public get speedResistance() {
        return this._speedResistance;
    }
    public get speedMin() {
        return this._speedMin;
    }
    public get speedMax() {
        return this._speedMax;
    }
    public get velocity() {
        return this._velocity;
    }

    constructor(
        mesh: THREE.Mesh,
        userInput: Framework.Entity.userInputInterface,
        controller: string = "default",

    ) {
        this.mesh = mesh;
        if (controller === "default") {
            this.controller = new EntityController(this, userInput);
        }
        // Calculate the correct position of the player when it should touch the ground and place on it
        // @ts-ignore
        this.groundCoordY = this.mesh.geometry.parameters.width / 2;
        this.mesh.position.y = this.groundCoordY; // put the cube on top of ground (y=0)
        this.mesh.castShadow = true;
    }

    update(delta: DOMHighResTimeStamp) {
       this.controller.updatePosition(delta);
    }


}