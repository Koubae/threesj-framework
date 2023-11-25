import * as THREE from "three";


export default class Brash {
    BRASH_MARGIN_Y = 2;

    constructor(editor, brashSize, segments = 32, lightSettings = null) {
        this.editor = editor;
        this.scene = this.editor.scene;
        this.camera = this.editor.camera;
        this.controls = this.editor.controls;
        this.terrain = this.editor.terrain;
        this.points = this.editor.points;
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

        // Drag
        this.drag = false;
        this.dragObject = null;
        this.dragObjects = null;

        this.dragPlane = new THREE.Plane();
        this.dragPlaneNormal = new THREE.Vector3(0, 1, 0);
        this.dragIntersection = new THREE.Vector3();
        this.dragPoint = new THREE.Vector3();
        this.dragShift = new THREE.Vector3();

        // Modes
        this.high_peak = true;

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
        this.updateRay(event);

        const intersects = this.rayCaster.intersectObject(this.points, false);  // if set recursive true, we could get also independently the LineSegments!
        if (!intersects.length) return;

        this.controls.enabled = false;
        this.drag = true;
        this.dragObject = intersects[0];
        this.dragObjects = {};
        intersects.forEach(dragObject => {
            if (dragObject.index && !(dragObject.index in this.dragObjects)) this.dragObjects[dragObject.index] = dragObject;
        });

        this.dragPoint.copy(this.dragObject.point);
        // To move it in 3D depending on camera position (top,bottom etc..)
        this.dragPlaneNormal.subVectors(this.camera.position, this.dragPoint).normalize();  //Change direction based on camera
        if (this.high_peak) {
            // we set the drag plane here already! The first object is the actual center point. The mountain peak will be at the center of pointer
            this.dragPlane.setFromNormalAndCoplanarPoint(this.dragPlaneNormal, this.dragPoint);
        }

        this.dragShift.subVectors(this.dragObject.object.position, this.dragPoint);
    }

    onPointerUp(_) {
        this.drag = false;
        this.dragObject = null;
        this.dragObjects = null;
        this.controls.enabled = true;
    }

    onPointerMove(event) {
        this.updateRay(event);
        this.moveBrush();
        this.modifyTerrain();
    }

    moveBrush() {
        this.rayCaster.ray.intersectPlane(this.pointerPlane, this.pointerIntersection);
        this.brash.position.addVectors(this.pointerIntersection, this.pointerShift);
        this.#moveBrashOnTopOfObstacles();
    }

    #moveBrashOnTopOfObstacles() {
        const intersects = this.rayCaster.intersectObject(this.terrain, false);
        let highestPoint = 0;
        intersects.forEach(intersection => {
            if (intersection.point.y > highestPoint) highestPoint = intersection.point.y;
        })
        this.brash.position.y = highestPoint + this.BRASH_MARGIN_Y;
    }

    modifyTerrain() {
        if (!this.drag || !this.dragObject) return;

        const _geometry = this.dragObject.object.geometry;
        if (this.high_peak) {
            // Setting high point one that is the same
            this.rayCaster.ray.intersectPlane(this.dragPlane, this.dragIntersection);
            this.dragObject.object.worldToLocal(this.dragIntersection);
        }

        for (const [index, _dragObject] of Object.entries(this.dragObjects)) {
            const position = _geometry.attributes.position;
            if (!this.high_peak) {
                this.dragPlane.setFromNormalAndCoplanarPoint(this.dragPlaneNormal, _dragObject.point);
                this.rayCaster.ray.intersectPlane(this.dragPlane, this.dragIntersection);
                _dragObject.object.worldToLocal(this.dragIntersection);
            }

            position.setXYZ(index, this.dragIntersection.x, this.dragIntersection.y, this.dragIntersection.z);
            position.needsUpdate = true;

        }
        _geometry.computeVertexNormals();
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