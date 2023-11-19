import * as Framework from "../../core/types";
import * as THREE from "three";
import {Vector3} from "three";
import {
    GRAVITY,
    PLAYER_MAX_FALL_SPEED,
    PLAYER_RUN,
    PLAYER_JUMP_FORCE
} from "../player.js";
import EntityInterface = Framework.Entity.EntityInterface;




function randomIntFromInterval(min: number, max: number): number { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

interface EntityControllerInterface {
    target: EntityInterface
    userInput:  Framework.Entity.userInputInterface
    userControl: Framework.Entity.userControlInterface
    state: Framework.Entity.userControlState

    windowSizeX: number
    windowSizeY: number
    windowSizeXHalf: number
    windowSizeYHalf: number

    updatePosition(delta: DOMHighResTimeStamp): void
}

// TODO: Fix this or remove
/*interface EntityControllerInterfaceConstructor {
    new(target: EntityInterface, userInput:  Framework.Entity.userInputInterface): EntityControllerInterface;
}*/

export declare var EntityControllerInterface: EntityController;
export const USER_CONTROL_DEFAULT: Framework.Entity.userControlInterface = {
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
// TODO: this is a very bad implementation is just for testing
const USER_CONTROL_WEIGHTS: any = {
    forward: 1,
    backward: 200,

    left: 1,
    right: 1,

    turnLeft: 300,
    turnRight: 300,

    panUp: null,
    panDown: null,
    panLeft: 50,
    panRight: 50,

    jump: 200,
    sprint: 5
};

export default class EntityController implements EntityControllerInterface {
    // ----------------- < PUBLIC > ----------------- \\
    target: EntityInterface;
    userInput:  Framework.Entity.userInputInterface;
    userControl: Framework.Entity.userControlInterface
    state: Framework.Entity.userControlState

    windowSizeX: number
    windowSizeY: number
    windowSizeXHalf: number
    windowSizeYHalf: number
    // ----------------- < PRIVATE > ----------------- \\

    constructor(target: EntityInterface, userInput:  null|Framework.Entity.userInputInterface = null) {
        this.target = target;
        if (userInput) {
            this.userInput = userInput;
        }

        // create a new userControl Object
        this.userControl = {...USER_CONTROL_DEFAULT};
        this.state = {
            jumping: {
                coolDown: .5, // values in seconds
                coolDownCurrent: 0,
                active: false,
                doubleJump: true,
                doubleJumpActive: false,
            },
            onGround: false,
        }

        this.windowSizeX = window.innerWidth;
        this.windowSizeY = window.innerHeight;
        this.windowSizeXHalf = this.windowSizeX / 2;
        this.windowSizeYHalf = this.windowSizeY / 2;

    }
    // --------------------------
    // Controller Movements and abilities
    // --------------------------
    calculateNextPosition() {
        // create a new userControl Object
        this.userControl = {...USER_CONTROL_DEFAULT};

        for(const [key, value] of Object.entries(this.userControl)) {
            let weight = USER_CONTROL_WEIGHTS[key];
            let enableControl = randomIntFromInterval(0, weight);
            if (enableControl !== 0) {
                continue;
            }
            if (typeof value === "number") {
                // @ts-ignore
                this.userControl[key] = randomIntFromInterval(10 , 250);
            } else if (typeof value === "boolean") {
                // @ts-ignore
                this.userControl[key] = true;

            }
        }

    }

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
    protected _forward(velocity: THREE.Vector3, speed: THREE.Vector3, delta: DOMHighResTimeStamp): void {
        velocity.z += speed.z * delta;
    }
    protected _backward(velocity: THREE.Vector3, speed: THREE.Vector3, delta: DOMHighResTimeStamp): void {
        velocity.z -= speed.z * delta;
    }
    protected _left(velocity: THREE.Vector3, speed: THREE.Vector3, delta: DOMHighResTimeStamp): void {
        velocity.x += speed.x * delta;
    }
    protected _right(velocity: THREE.Vector3, speed: THREE.Vector3, delta: DOMHighResTimeStamp): void {
        velocity.x -= speed.x * delta;
    }
    // Special Abilities
    protected _jump(velocity: THREE.Vector3, delta: DOMHighResTimeStamp): void {
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

    protected _sprint(speed: THREE.Vector3): void {
        if (this.userControl.sprint) {
            speed.multiplyScalar(PLAYER_RUN);
        }
    }

    // TODO: fixme this is currently garbage
    protected panPlayerHorizontally(userControl: any, angle: any, delta: any, axis: any, rotation: any, speed: Vector3) {
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

    /**
     * Adds Resistance to a velocity, basically reducing the speed by friction
     * @param velocity
     * @param delta
     * @private
     */
    protected _velocityApplyResistance(velocity: THREE.Vector3, delta: DOMHighResTimeStamp): void  {
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