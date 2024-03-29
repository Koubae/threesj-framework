import * as THREE from "three";
import * as editors from "./editors/index.js";


export default class Brash {
    BRASH_MARGIN_Y = 2;
    BRASH_CAMERA_MARGIN_Y = 0;

    constructor(editor, brashSize, segments = 32, lightSettings = null) {
        this.editorManager = editor;
        this.scene = this.editorManager.scene;
        this.camera = this.editorManager.camera;
        this.controls = this.editorManager.controls;
        this.terrain = this.editorManager.terrain;
        this.points = this.editorManager.points;
        this.brashSize = brashSize;
        this.segments = segments;
        this.lightSettings = lightSettings || {
            color: "yellow",
            intensity: 100,
            power: 50,
            decay: 1
        }
        this.brash = this.#buildBrash();

        this.brashCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.brashCamera.rotateX(-Math.PI / 2);

        this.rayCaster = new THREE.Raycaster();

        this.rayCasterBrash = new THREE.Raycaster();
        this.rayCasterBrash.params.Points.threshold = this.brashSize;
        this.pointer = new THREE.Vector2();

        // Pointer Ray
        this.pointerPlaneNormal = new THREE.Vector3(0, 1, 0);
        this.pointerPlane = new THREE.Plane(this.pointerPlaneNormal);
        this.pointerIntersection = new THREE.Vector3();
        this.pointerShift = new THREE.Vector3();

        // Modes
        this.editors = {
            "Pointy Mountains": new editors.EditorPointyMountains(this),
            "Multy Pointy Mountains": new editors.EditorMultiplePointyMountains(this),
            "Round Mountain": new editors.EditorRoundMountain(this),
            "Debug Points": new editors.EditorDebugChangeColorPoints(this),
        }
        this.currentEditor = "Debug Points";

        this.#buildLight();

        this.scene.add(this.brashCamera);
        this.scene.add(this.brash);

        this.scene.add(new THREE.CameraHelper((this.brashCamera)));

        this.#buildEvents();

    }

    get editor() {
        return this.editors[this.currentEditor];
    }

    #buildBrash() {
        const brash = new THREE.Mesh(
            new THREE.CircleGeometry(this.brashSize, this.segments),
            new THREE.MeshLambertMaterial({
                color: this.lightSettings.color,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide,
                wireframe: false,
                reflectivity: 1,
                emissive: this.lightSettings.color,
            })
        );
        brash.rotateX(-Math.PI / 2);
        return brash
    }

    #buildLight() {
        const pointerLight = new THREE.PointLight(this.lightSettings.color, this.lightSettings.intensity);
        pointerLight.castShadow = false; // Expensive!!!
        pointerLight.power = this.lightSettings.power;
        pointerLight.decay = this.lightSettings.decay;
        this.brash.add(pointerLight);
    }

    #buildEvents() {
        document.addEventListener('pointerdown', this.onPointerDown.bind(this), false);
        document.addEventListener('pointerup', this.onPointerUp.bind(this), false);
        document.addEventListener('pointermove', this.onPointerMove.bind(this), false);
    }

    onPointerDown(event) {
        if (!event.shiftKey) return;
        this.editor.onPointerDown(event);

    }

    onPointerUp(event) {
        this.editor.onPointerUp(event);
    }

    onPointerMove(event) {
        this.updateRay(event);
        this.moveBrush();
        this.editor.onPointerMove(event);
    }

    moveBrush() {
        this.rayCaster.ray.intersectPlane(this.pointerPlane, this.pointerIntersection);
        this.brash.position.addVectors(this.pointerIntersection, this.pointerShift);
        this.#moveBrashOnTopOfObstacles();
        this.#moveCamera();
    }

    #moveBrashOnTopOfObstacles() {
        const intersects = this.rayCaster.intersectObject(this.terrain, false);
        let highestPoint = 0;
        intersects.forEach(intersection => {
            if (intersection.point.y > highestPoint) highestPoint = intersection.point.y;
        })
        this.brash.position.y = highestPoint + this.BRASH_MARGIN_Y;
    }

    #moveCamera() {
        this.brashCamera.position.set(this.brash.position.x, this.brash.position.y + this.BRASH_CAMERA_MARGIN_Y, this.brash.position.z);
    }


    updateRay(event) {
        this.updatePointer(event);
        this.rayCaster.setFromCamera(this.pointer, this.camera);
    }

    updateRayBrash(event) {
        this.updatePointer(event);
        this.rayCasterBrash.setFromCamera(this.pointer, this.brashCamera);
    }

    updatePointer(event) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

}