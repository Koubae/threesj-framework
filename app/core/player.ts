import * as THREE from "three";
import {Framework} from "./types.js";

// todo: add interface
const USER_CONTROL_DEFAULT: any = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
};

export class PlayerController {
    // ----------------- < PUBLIC > ----------------- \\
    userInput:  Framework.Player.userInputInterface;
    userControl: any = USER_CONTROL_DEFAULT;
    state: any = { // todo: make interface / or actually another class as this are common states/ability for movements
        jumping: {
            coolDown: .5, // values in seconds
            coolDownCurrent: 0,
            active: false,
            doubleJump: true,
            doubleJumpActive: false,
        },
        onGround: false,
    }

    // ----------------- < PRIVATE > ----------------- \\



    constructor(userInput:  Framework.Player.userInputInterface) {
        this.userInput = userInput;
    }

    registerInput() {
        // create a new userControl Object
        this.userControl = {...USER_CONTROL_DEFAULT};
        // register current inputs
        this.userInput.allKeyPressed.forEach(key => {
           this.keyListener(key);
        });

    }

    keyListener(key: string|null) {
        if (key === null)  return;
        switch (key) {
            case "w":
            case "arrowup":
                this.userControl.forward = true;
                break;
            case "s":
            case "arrowdown":
                this.userControl.backward = true;
                break;
            case "a":
            case "arrowleft":
                this.userControl.left = true;
                break;
            case "d":
            case "arrowright":
                this.userControl.right = true;
                break;
            case " ":
                this.userControl.jump = true;
                break;
            case "shift":
                this.userControl.sprint = true;
                break;
            default:
                break;

        }
    }
}

const GRAVITY = 50;
const PLAYER_MAX_SPEED: number = 10;
const PLAYER_MAX_FALL_SPEED: number = 2.5;
const PLAYER_RUN: number = 2.5;
const PLAYER_JUMP_FORCE: number = 120;

export default class Player {

    // ----------------- < PUBLIC > ----------------- \\
    mesh: THREE.Mesh;
    playerController: PlayerController;

    // ----------------- < PRIVATE > ----------------- \\
    #speed = new THREE.Vector3(1, 0.25, 25.0);
    #speedResistance = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    #speedMin = new THREE.Vector3(-PLAYER_MAX_SPEED, -PLAYER_MAX_SPEED, -PLAYER_MAX_SPEED);
    #speedMax = new THREE.Vector3(PLAYER_MAX_SPEED, PLAYER_MAX_SPEED, PLAYER_MAX_SPEED);

    #velocity = new THREE.Vector3(0, 0, 0);


    constructor(
        mesh: THREE.Mesh,
        playerController: PlayerController
    ) {
        this.mesh = mesh;
        this.playerController = playerController;
    }

    update(delta: DOMHighResTimeStamp) {
        this.playerController.registerInput();
        const userControl = this.playerController.userControl;

        const speed = this.#speed.clone();
        const velocity = this.#velocity;
        const resistance = new THREE.Vector3(
            velocity.x * this.#speedResistance.x,
            velocity.y * this.#speedResistance.y,
            velocity.z * this.#speedResistance.z
        );

        resistance.multiplyScalar(delta);
        resistance.z = Math.sign(resistance.z) * Math.min(
            Math.abs(resistance.z), Math.abs(velocity.z));

        velocity.add(resistance);

        const state = this.playerController.state;
        const mesh = this.mesh;
        const axis = new THREE.Quaternion();
        const angle = new THREE.Vector3();
        const rotation = mesh.quaternion.clone();

        if (userControl.sprint) {
            speed.multiplyScalar(PLAYER_RUN);
        }

        if (userControl.forward) {
            velocity.z += speed.z * delta;
        } else if (userControl.backward) {
            velocity.z -= speed.z * delta;
        } else {
            velocity.z = 0;
        }
        if (userControl.left) {
            angle.set(0, 1, 0);
            axis.setFromAxisAngle(angle, 4.0 * Math.PI * delta * this.#speed.y);
            rotation.multiply(axis);
        } else if (userControl.right) {
            angle.set(0, 1, 0);
            axis.setFromAxisAngle(angle, 4.0 * -Math.PI * delta * this.#speed.y);
            rotation.multiply(axis);
        }

        const jumping = state.jumping;

        velocity.y += (GRAVITY * delta ) * 0.20;
        if (velocity.y > PLAYER_MAX_FALL_SPEED) velocity.y = PLAYER_MAX_FALL_SPEED;
        if (userControl.jump && !jumping.active) {
            velocity.y -= PLAYER_JUMP_FORCE * delta;
            jumping.active = true;
            state.onGround = false;
            jumping.coolDownCurrent = jumping.coolDown;
        } else {
            jumping.coolDownCurrent -= delta;
        }

        if (userControl.jump && velocity.y > 0 && jumping.active && jumping.doubleJump && !jumping.doubleJumpActive) {
            if (!state.onGround) {
                jumping.doubleJumpActive = true;
                velocity.y = 0;
                velocity.y -= PLAYER_JUMP_FORCE * delta;
            }

        }

        if (jumping.coolDownCurrent <= 0) {
            jumping.coolDownCurrent = 0;
            jumping.active = false;
            jumping.doubleJumpActive = false;
        }


        mesh.quaternion.copy(rotation);

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(mesh.quaternion);
        forward.normalize();

        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(mesh.quaternion);
        sideways.normalize();

        forward.multiplyScalar(velocity.z * delta);
        sideways.multiplyScalar(velocity.x * delta);

        // Apply Gravity
        let groundYPos = this.getMeshGroundCoord();
        this.mesh.position.y -= velocity.y;
        let currentY = this.mesh.position.y;
        if (currentY < groundYPos) {
            state.onGround = true;
            this.mesh.position.y = groundYPos;
            velocity.y = 0;
        }

        // clamp forward and sideways speed
        forward.clamp(this.#speedMin, this.#speedMax);
        sideways.clamp(this.#speedMin, this.#speedMax);
        this.mesh.position.add(forward);
        this.mesh.position.add(sideways);

    }

    getMeshGroundCoord(): number {
        // @ts-ignore
        return this.mesh.geometry.parameters.width / 2; // put the cube on top of ground (y=0);
    }

}