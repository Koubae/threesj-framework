// todo: add interface
import * as Framework from "../../core/types";
import * as THREE from "three";
import EntityInterface = Framework.Entity.EntityInterface;
import EntityController,  { USER_CONTROL_DEFAULT } from "./entityController.js";


const PLAYER_PAN_SPEED_MAX_X: number = 250;
const PLAYER_PAN_SPEED_MAX_Y: number = 100;
export default class PlayerController extends EntityController {
    // ----------------- < PUBLIC > ----------------- \\
    // ----------------- < PRIVATE > ----------------- \\
    constructor(target: EntityInterface, userInput:  Framework.Entity.userInputInterface) {
        super(target, userInput);
    }

    calculateNextPosition() {
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
    /**
     * @override
     * @param delta
     */
    updatePosition(delta: DOMHighResTimeStamp) {
        this.calculateNextPosition();
        const target = this.target;
        const userControl = this.userControl;

        const speed = target.speed.clone();
        const velocity = target.velocity;
        this._velocityApplyResistance(velocity, delta);

        const state = this.state;
        const mesh = target.mesh;
        const axis = new THREE.Quaternion();
        const angle = new THREE.Vector3();
        const rotation = mesh.quaternion.clone();

        this._sprint(speed);
        this._jump(velocity, delta);

        if (userControl.forward) {
            this._forward(velocity, speed, delta);
        } else if (userControl.backward) {
            this._backward(velocity, speed, delta);
        } else {
            velocity.z = 0;
        }
        if (userControl.left) {
            this._left(velocity, speed, delta);
        } else if (userControl.right) {
            this._right(velocity, speed, delta);
        } else {
            velocity.x = 0;
        }

        this.panPlayerHorizontally(userControl, angle, delta, axis, rotation, target.speed);
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

}