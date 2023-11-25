import Editor from "./Editor.js";

export default class EditorPointyMountains extends Editor {
    onPointerDown(event) {
        const goOn = super.onPointerDown(event);
        if (!goOn) return;

        // we set the drag plane here already! The first object is the actual center point. The mountain peak will be at the center of pointer
        this.dragPlane.setFromNormalAndCoplanarPoint(this.dragPlaneNormal, this.dragPoint);
    }

    onPointerMove(event) {
        const goOn = super.onPointerMove(event);
        if (!goOn) return;

        const _geometry = this.grabbedClosest.object.geometry;
        // Setting high point one that is the same
        this.brash.rayCaster.ray.intersectPlane(this.dragPlane, this.dragIntersection);
        this.grabbedClosest.object.worldToLocal(this.dragIntersection);

        for (const [index, _dragObject] of Object.entries(this.grabbedObjects)) {
            const position = _geometry.attributes.position;

            position.setXYZ(index, this.dragIntersection.x, this.dragIntersection.y, this.dragIntersection.z);
            position.needsUpdate = true;

        }
        _geometry.computeVertexNormals();

    }

}