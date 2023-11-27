import * as THREE from "three";

export default class Editor {
    constructor(brash) {
        this.brash = brash;
        this.drag = false;
        this.grabbedClosest = null;
        this.grabbedObjects = null;

        this.dragPlane = new THREE.Plane();
        this.dragPlaneNormal = new THREE.Vector3(0, 1, 0);
        this.dragIntersection = new THREE.Vector3();
        this.dragPoint = new THREE.Vector3();
        this.dragShift = new THREE.Vector3();
    }

    onPointerDown(event) {
        this.brash.updateRay(event);

        const intersects = this.brash.rayCaster.intersectObject(this.brash.points, false);  // if set recursive true, we could get also independently the LineSegments!
        if (!intersects.length) return false;

        this.brash.controls.enabled = false;
        this.drag = true;

        // sort objects by distance to ray
        intersects.sort((a, b) => a.distanceToRay - b.distanceToRay);
        this.grabbedClosest = intersects[0];
        this.grabbedObjects = {};
        intersects.forEach(dragObject => {
            if (dragObject.index && !(dragObject.index in this.grabbedObjects)) this.grabbedObjects[dragObject.index] = dragObject;
        });


        this.dragPoint.copy(this.grabbedClosest.point);
        // To move it in 3D depending on camera position (top,bottom etc..)
        this.dragPlaneNormal.subVectors(this.brash.camera.position, this.dragPoint).normalize();  //Change direction based on camera
        this.dragShift.subVectors(this.grabbedClosest.object.position, this.dragPoint);
        return true;
    }

    onPointerUp(_) {
        this.drag = false;
        this.grabbedClosest = null;
        this.grabbedObjects = null;
        this.brash.controls.enabled = true;
        return true;
    }

    onPointerMove(event) {
        if (!event.shiftKey) return false;
        return this.modifyTerrain();
    }

    modifyTerrain() {
        if (!this.drag || !this.grabbedClosest) return false;
        return true;
    }


}