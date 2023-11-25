import * as THREE from "three";


export default class Brash {
    constructor(scene, camera, brashSize, segments = 32, lightSettings = null) {
        this.scene = scene;
        this.camera = camera;
        this.brashSize = brashSize;
        this.segments = segments;
        this.lightSettings = lightSettings || {
            color: "yellow",
            intensity: 100,
            power: 50,
            decay: 1
        }
        this.brash = this.#buildBrash();

        this.rayCaster = new THREE.Raycaster();
        this.rayCaster.params.Points.threshold = this.brashSize;
        this.pointer = new THREE.Vector2();

       // Pointer Ray
        this.pointerPlaneNormal = new THREE.Vector3(0, 1, 0);
        this.pointerPlane = new THREE.Plane(this.pointerPlaneNormal);
        this.pointerIntersection = new THREE.Vector3();
        this.pointerShift = new THREE.Vector3();


        this.#buildLight();
        this.scene.add(this.brash);

        this.#buildEvents();

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
    }

    onPointerUp(event) {
    }

    onPointerMove(event) {
        this.updateRay(event);
        this.moveBrush();
    }

    moveBrush() {
        this.rayCaster.ray.intersectPlane(this.pointerPlane, this.pointerIntersection);
        this.brash.position.addVectors(this.pointerIntersection, this.pointerShift);
    }

    updateRay(event) {
        this.updatePointer(event);
        this.rayCaster.setFromCamera(this.pointer, this.camera);
    }

    updatePointer(event) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

}