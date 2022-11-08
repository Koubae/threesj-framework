import * as THREE from "three";
import {Framework} from "./types.js";
import {Vector3} from "three";

// todo: add interface
const USER_CONTROL_DEFAULT: any = {
    forward: false,
    backward: false,

    left: false,
    right: false,

    turnLeft: false,
    turnRight: false,

    panUp: 0.00,
    panDown: 0.00,
    panLeft: 0.00,
    panRight: 0.00,

    jump: false,
    sprint: false,
};

const PLAYER_PAN_SPEED_MAX_X: number = 250;
const PLAYER_PAN_SPEED_MAX_Y: number = 100;

export class PlayerController {
    // ----------------- < PUBLIC > ----------------- \\
    target: Player;
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

    windowSizeX: number = window.innerWidth;
    windowSizeY: number = window.innerHeight;
    windowSizeXHalf: number = this.windowSizeX / 2;
    windowSizeYHalf: number = this.windowSizeY / 2;

    // ----------------- < PRIVATE > ----------------- \\

    constructor(target: Player, userInput:  Framework.Player.userInputInterface) {
        this.target = target;
        this.userInput = userInput;
    }

    #registerInput() {
        // create a new userControl Object
        this.userControl = {...USER_CONTROL_DEFAULT};
        // register current inputs
        this.userInput.allKeyPressed.forEach(key => {
           this.keyListener(key);
        });
        // Check mouse position
        const POINTER_MARGINX = 250;
        const POINTER_MARGINY = 50;
        let pointerX = this.userInput.pointer.x;
        let pointerY = this.userInput.pointer.y;

        // Calculate X position
        if (pointerX) {
            if (pointerX + POINTER_MARGINX < this.windowSizeXHalf) {
                this.userControl.panLeft = Math.abs((pointerX + POINTER_MARGINX) + -this.windowSizeXHalf);
            } else if (pointerX - POINTER_MARGINX > this.windowSizeXHalf) {
                this.userControl.panRight = (pointerX - POINTER_MARGINX) - this.windowSizeXHalf;
            }
        }
        if (this.userControl.panLeft > PLAYER_PAN_SPEED_MAX_X) this.userControl.panLeft = PLAYER_PAN_SPEED_MAX_X;
        if (this.userControl.panRight > PLAYER_PAN_SPEED_MAX_X) this.userControl.panRight = PLAYER_PAN_SPEED_MAX_X;

        // Calculate Y Position
        if (pointerY) {
            if (pointerY + POINTER_MARGINY < this.windowSizeYHalf) {
                this.userControl.panDown = Math.abs((pointerY + POINTER_MARGINY) + -this.windowSizeYHalf);
            } else if (pointerY - POINTER_MARGINY > this.windowSizeYHalf) {
                this.userControl.panUp = (pointerY - POINTER_MARGINY) - this.windowSizeYHalf;
            }
        }
        if (this.userControl.panUp > PLAYER_PAN_SPEED_MAX_Y) this.userControl.panUp = PLAYER_PAN_SPEED_MAX_Y;
        if (this.userControl.panDown > PLAYER_PAN_SPEED_MAX_Y) this.userControl.panDown = PLAYER_PAN_SPEED_MAX_Y;

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
                this.userControl.turnLeft = true;
                break;
            case "arrowleft":
                this.userControl.left = true;
                break;
            case "d":
                this.userControl.turnRight = true;
                break;
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

    // --------------------------
    // Controller Movements and abilities
    // --------------------------

    updatePosition(delta: DOMHighResTimeStamp) {
        this.#registerInput();
        const target = this.target;
        const userControl = this.userControl;

        const speed = target.speed.clone();
        const velocity = target.velocity;
        this.#_velocityApplyResistance(velocity, delta);

        const state = this.state;
        const mesh = target.mesh;
        const axis = new THREE.Quaternion();
        const angle = new THREE.Vector3();
        const rotation = mesh.quaternion.clone();

        this.#_sprint(speed);
        this.#_jump(velocity, delta);

        if (userControl.forward) {
            this.#_forward(velocity, speed, delta);
        } else if (userControl.backward) {
            this.#_backward(velocity, speed, delta);
        } else {
            velocity.z = 0;
        }
        if (userControl.left) {
            this.#_left(velocity, speed, delta);
        } else if (userControl.right) {
            this.#_right(velocity, speed, delta);
        } else {
            velocity.x = 0;
        }

        this.#panPlayerHorizontally(userControl, angle, delta, axis, rotation, target.speed);
        // TODO: right now, it move the player. We need to pan the camera only!
        this.#panPlayerVertically(mesh, userControl, rotation, delta, axis, angle);

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
        let groundYPos = target.groundCoordY;
        target.mesh.position.y -= velocity.y;
        let currentY = target.mesh.position.y;
        if (currentY < groundYPos) {
            state.onGround = true;
            target.mesh.position.y = groundYPos;
            velocity.y = 0;
        }

        // clamp forward and sideways speed
        forward.clamp(target.speedMin, target.speedMax);
        sideways.clamp(target.speedMin, target.speedMax);
        target.mesh.position.add(forward);
        target.mesh.position.add(sideways);
    }

    // Movements
    #_forward(velocity: THREE.Vector3, speed: THREE.Vector3, delta: DOMHighResTimeStamp): void {
        velocity.z += speed.z * delta;
    }
    #_backward(velocity: THREE.Vector3, speed: THREE.Vector3, delta: DOMHighResTimeStamp): void {
        velocity.z -= speed.z * delta;
    }
    #_left(velocity: THREE.Vector3, speed: THREE.Vector3, delta: DOMHighResTimeStamp): void {
        velocity.x += speed.x * delta;
    }
    #_right(velocity: THREE.Vector3, speed: THREE.Vector3, delta: DOMHighResTimeStamp): void {
        velocity.x -= speed.x * delta;
    }
    // Special Abilities
    #_jump(velocity: THREE.Vector3, delta: DOMHighResTimeStamp): void {
        const jumping = this.state.jumping;
        velocity.y += (GRAVITY * delta ) * 0.20;
        if (velocity.y > PLAYER_MAX_FALL_SPEED) velocity.y = PLAYER_MAX_FALL_SPEED;
        if (this.userControl.jump && !jumping.active) {
            velocity.y -= PLAYER_JUMP_FORCE * delta;
            jumping.active = true;
            this.state.onGround = false;
            jumping.coolDownCurrent = jumping.coolDown;
        } else {
            jumping.coolDownCurrent -= delta;
        }

        if (this.userControl.jump && velocity.y > 0 && jumping.active && jumping.doubleJump && !jumping.doubleJumpActive) {
            if (!this.state.onGround) {
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
    }

    #_sprint(speed: THREE.Vector3): void {
        if (this.userControl.sprint) {
            speed.multiplyScalar(PLAYER_RUN);
        }
    }


    // TODO: fixme this is currently garbage
    #panPlayerHorizontally(userControl: any, angle: any, delta: any, axis: any, rotation: any, speed: Vector3) {
        // check mouse position
        if (userControl.panLeft) {
            angle.set(0, 1, 0);
            axis.setFromAxisAngle(angle, 4.0 * Math.PI * delta * userControl.panLeft / 1000);
            rotation.multiply(axis);
        } else if (userControl.panRight) {
            angle.set(0, 1, 0);
            axis.setFromAxisAngle(angle, 4.0 * -Math.PI * delta * userControl.panRight / 1000);
            rotation.multiply(axis);
        } else {    // avoid turn twice. player mouse position has precedence
            if (userControl.turnLeft) {
                angle.set(0, 1, 0);
                axis.setFromAxisAngle(angle, 4.0 * Math.PI * delta * speed.y);
                rotation.multiply(axis);
            } else if (userControl.turnRight) {
                angle.set(0, 1, 0);
                axis.setFromAxisAngle(angle, 4.0 * -Math.PI * delta * speed.y);
                rotation.multiply(axis);
            }
        }

    }

    // TODO: right now, it move the player. We need to pan the camera only!
    // TODO: fixme this is currently garbage
    #panPlayerVertically(mesh: any, userControl: any, rotation: any, delta: any, axis: any, angle: any) {
        const FIX = false;
        if (FIX) {
            const rotationPan = mesh.quaternion.clone();
            let pan = false;
            if (userControl.panUp) {
                if (rotation.x < .8) {
                    angle.set(1, 0, 0);
                    axis.setFromAxisAngle(angle, 4.0 * Math.PI * delta * userControl.panUp / 1000);
                    rotationPan.multiply(axis);
                    pan = true;
                }

            } else if (userControl.panDown) {
                if (rotation.x > -.8) {
                    angle.set(1, 0, 0);
                    axis.setFromAxisAngle(angle, 4.0 * -Math.PI * delta * userControl.panDown / 1000);
                    rotationPan.multiply(axis);
                    pan = true;
                }
            }
            if (pan) {
                this.target.rotationPan = rotationPan;
            } else {
                this.target.rotationPan = null;
            }
        }
    }

    /**
     * Adds Resistance to a velocity, basically reducing the speed by friction
     * @param velocity
     * @param delta
     * @private
     */
    #_velocityApplyResistance(velocity: THREE.Vector3, delta: DOMHighResTimeStamp): void  {
        const resistance = new THREE.Vector3(
            velocity.x * this.target.speedResistance.x,
            velocity.y * this.target.speedResistance.y,
            velocity.z * this.target.speedResistance.z
        );

        resistance.multiplyScalar(delta);
        resistance.z = Math.sign(resistance.z) * Math.min(
            Math.abs(resistance.z), Math.abs(velocity.z));

        resistance.x = Math.sign(resistance.x) * Math.min(
            Math.abs(resistance.x), Math.abs(velocity.x));

        resistance.y = Math.sign(resistance.y) * Math.min(
            Math.abs(resistance.y), Math.abs(velocity.y));

        velocity.add(resistance);
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
    rotationPan: THREE.Quaternion|null = null;
    groundCoordY: number;

    // ----------------- < PRIVATE > ----------------- \\
    #speed: THREE.Vector3 = new THREE.Vector3(10, 0.25, 25.0);
    #speedResistance: THREE.Vector3 = new THREE.Vector3(-2, -5.0, -5.0);
    #speedMin: THREE.Vector3 = new THREE.Vector3(-PLAYER_MAX_SPEED, -PLAYER_MAX_SPEED, -PLAYER_MAX_SPEED);
    #speedMax: THREE.Vector3 = new THREE.Vector3(PLAYER_MAX_SPEED, PLAYER_MAX_SPEED, PLAYER_MAX_SPEED);
    #velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    get speed(): THREE.Vector3 {
        return this.#speed;
    }
    get speedResistance(): THREE.Vector3 {
        return this.#speedResistance;
    }
    get speedMin(): THREE.Vector3 {
        return this.#speedMin;
    }
    get speedMax(): THREE.Vector3 {
        return this.#speedMax;
    }
    get velocity(): THREE.Vector3 {
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