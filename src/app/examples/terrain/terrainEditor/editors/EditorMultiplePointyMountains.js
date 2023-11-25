import Editor from "./Editor.js";

export default class EditorMultiplePointyMountains extends Editor {
    onPointerMove(event) {
        const goOn = super.onPointerMove(event);
        if (!goOn) return;

        const _geometry = this.grabbedClosest.object.geometry;
        for (const [index, _dragObject] of Object.entries(this.grabbedObjects)) {
            const position = _geometry.attributes.position;
            this.dragPlane.setFromNormalAndCoplanarPoint(this.dragPlaneNormal, _dragObject.point);
            this.brash.rayCaster.ray.intersectPlane(this.dragPlane, this.dragIntersection);
            _dragObject.object.worldToLocal(this.dragIntersection);

            position.setXYZ(index, this.dragIntersection.x, this.dragIntersection.y, this.dragIntersection.z);
            position.needsUpdate = true;

        }
        _geometry.computeVertexNormals();

    }

}