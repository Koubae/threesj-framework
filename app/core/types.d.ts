import * as THREE from "three";
import PlayerController from "../entities/controller/playerController";
import {Vector3} from "three";
import {PLAYER_MAX_SPEED} from "../entities/player";
import {EntityControllerInterface} from "../entities/controller/entityController.js";

export namespace Framework {

    export namespace Types {
        type Nullable<T> = T | null;
    }

    // Entity Types
    export namespace Entity {
        interface EntityInterface {
            // ----------------- < PUBLIC > ----------------- \\
            mesh: THREE.Mesh
            controller: EntityControllerInterface
            rotationPan: THREE.Quaternion|null
            groundCoordY: number
            speed: Vector3
            speedResistance: Vector3
            speedMin: Vector3
            speedMax: Vector3
            velocity: Vector3

        }

        interface userInputInterface {
            allKeyPressed: string[]
            keyUpCurrent: string|null
            keyUpPrevious: string|null

            keyDownCurrent: string|null
            keyDownPrevious: string|null

            pointer: {
                x: null|number,
                y: null|number
            }
        }

        interface userControlState {
            jumping: {
                coolDown: number
                coolDownCurrent: number
                active: boolean
                doubleJump: boolean
                doubleJumpActive: boolean
            },
            onGround: boolean
        }

        interface userControlInterface {
            forward: boolean
            backward: boolean
            left: boolean
            right: boolean

            turnLeft: boolean
            turnRight: boolean

            panUp: number
            panDown: number
            panLeft: number
            panRight: number

            jump: boolean
            sprint: boolean

        }
    }
}