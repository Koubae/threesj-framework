import Editor from "./Editor.js";

export default class EditorDebugChangeColorPoints extends Editor {
    onPointerMove(event) {
        this.resetPointsColor();
        this.intersectPoints(event);
        if (!this.grabbedClosest) return false;

        this.markIntersectedPoints();
    }

    resetPointsColor() {
        this.brash.editorManager._color.setRGB(255, 255, 0);
        const pointsGeometry = this.brash.points.geometry;
        const pointsColors = pointsGeometry.attributes.color;
        for (let i = 0; i < pointsColors.array.length; i += 3) {
            pointsColors.array[i] = this.brash.editorManager._color.r;
            pointsColors.array[i + 1] = this.brash.editorManager._color.g;
            pointsColors.array[i + 2] = this.brash.editorManager._color.b;
        }
        pointsColors.needsUpdate = true;
    }

    intersectPoints(event) {
        this.brash.updateRayBrash(event);
        const intersects = this.brash.rayCasterBrash.intersectObject(this.brash.points, false);  // if set recursive true, we could get also independently the LineSegments!
        if (!intersects.length) return false;

        // sort objects by distance to ray
        intersects.sort((a, b) => a.distanceToRay - b.distanceToRay);
        this.grabbedClosest = intersects[0];
        this.grabbedObjects = {};
        intersects.forEach(dragObject => {
            if (dragObject.index && !(dragObject.index in this.grabbedObjects)) this.grabbedObjects[dragObject.index] = dragObject;
        });

        this.dragPoint.copy(this.grabbedClosest.point);
        // To move it in 3D depending on camera position (top,bottom etc..)
        this.dragPlaneNormal.subVectors(this.brash.brashCamera.position, this.dragPoint).normalize();  //Change direction based on camera
        this.dragShift.subVectors(this.grabbedClosest.object.position, this.dragPoint);
    }

    markIntersectedPoints() {
        this.brash.editorManager._color.setRGB(255, 0, 0);
        const _geometry = this.grabbedClosest.object.geometry;
        for (const [index, _dragObject] of Object.entries(this.grabbedObjects)) {
            const color = _geometry.getAttribute("color");

            color.setXYZ(index, this.brash.editorManager._color.r, this.brash.editorManager._color.g, this.brash.editorManager._color.b);
            color.needsUpdate = true;

        }
        _geometry.computeVertexNormals();
    }

}