import * as THREE from "three";
import Player from "../../entities/player.js";

// x: determines the look from the player left/right shoulder (or right in center if set to 0)
// y: depends how tall is the player
// z: how far away from the player
const CAMERA_OFFSET = new THREE.Vector3(0, 5, -10);
const CAMERA_LOOKAT = new THREE.Vector3(0, 0, 50);

export default class ThirdPersonCamera {
    // ----------------- < PUBLIC > ----------------- \\
    camera: THREE.PerspectiveCamera|THREE.OrthographicCamera;
    target: Player
    // ----------------- < PRIVATE > ----------------- \\
    #_currentPosition: THREE.Vector3;
    #_currentLookAt: THREE.Vector3;

    constructor(camera: THREE.PerspectiveCamera|THREE.OrthographicCamera, target: Player) {
        this.camera = camera;
        this.target = target;

        this.#_currentPosition = new THREE.Vector3();
        this.#_currentLookAt = new THREE.Vector3();
    }

    #_calculateOffset() {
        const coords = CAMERA_OFFSET.clone();
        coords.applyQuaternion(this.target.mesh.quaternion);
        coords.add(this.target.mesh.position);
        return coords;
    }

    #_calculateLookAt() {
        const coords = CAMERA_LOOKAT.clone();
        coords.applyQuaternion(this.target.mesh.quaternion);
        coords.add(this.target.mesh.position);
        return coords;
    }

    update(delta: DOMHighResTimeStamp) {
        const offset = this.#_calculateOffset();
        const lookAt = this.#_calculateLookAt();

        const t = 1.0 - Math.pow(0.001, delta);

        this.#_currentPosition.lerp(offset, t);
        this.#_currentLookAt.lerp(lookAt, t);
        this.camera.position.copy(this.#_currentPosition);
        this.camera.lookAt(this.#_currentLookAt);
    }
}