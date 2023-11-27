import Editor from "./Editor.js";

export default class EditorRoundMountain extends Editor {
    onPointerDown(event) {
        const goOn = super.onPointerDown(event);
        if (!goOn) return;

        // we set the drag plane here already! The first object is the actual center point. The mountain peak will be at the center of pointer
        // this.dragPlane.setFromNormalAndCoplanarPoint(this.dragPlaneNormal, this.dragPoint);
    }

    onPointerMove(event) {
        const goOn = super.onPointerMove(event);
        if (!goOn) return;

        // const _geometry = this.grabbedClosest.object.geometry;
        // for (const [index, _dragObject] of Object.entries(this.grabbedObjects)) {
        //     const position = _geometry.attributes.position;
        //     this.dragPlane.setFromNormalAndCoplanarPoint(this.dragPlaneNormal, _dragObject.point);
        //     this.brash.rayCaster.ray.intersectPlane(this.dragPlane, this.dragIntersection);
        //     _dragObject.object.worldToLocal(this.dragIntersection);
        //
        //     position.setXYZ(index, this.dragIntersection.x, this.dragIntersection.y, this.dragIntersection.z);
        //     position.needsUpdate = true;
        //
        // }
        // _geometry.computeVertexNormals();


       //  const _geometry = this.grabbedClosest.object.geometry;
       //  // Setting high point one that is the same
       //  this.brash.rayCaster.ray.intersectPlane(this.dragPlane, this.dragIntersection);
       //  this.grabbedClosest.object.worldToLocal(this.dragIntersection);
       //
       //  // const position = _geometry.attributes.position;
       //
       //  // position.setXYZ(this.grabbedClosest.index, this.dragIntersection.x, this.dragIntersection.y, this.dragIntersection.z);
       //  // position.needsUpdate = true;
       //
       //  const distancesTORay =[this.grabbedClosest.distanceToRay];
       //  const dist =[this.grabbedClosest.distance];
       //
       // for (const [index, _dragObject] of Object.entries(this.grabbedObjects)) {
       //     // if (_dragObject === this.grabbedClosest) continue;
       //
       //     const distanceFromBrashCenter = _dragObject.distanceToRay;
       //
       //     distancesTORay.push(distanceFromBrashCenter);
       //     dist.push(_dragObject.distance);
       //
       //      const position = _geometry.attributes.position;
       //      const dragPoint = _dragObject.point;
       //      // this.dragPlaneNormal.subVectors(this.brash.camera.position, dragPoint).normalize();  //Change direction based on camera
       //      // this.dragPlane.setFromNormalAndCoplanarPoint(this.dragPlaneNormal, dragPoint);
       //      // this.brash.rayCaster.ray.intersectPlane(this.dragPlane, this.dragIntersection);
       //      // _dragObject.object.worldToLocal(this.dragIntersection);
       //
       //      position.setXYZ(index, this.dragIntersection.x, this.dragIntersection.y, this.dragIntersection.z);
       //      position.needsUpdate = true;
       //
       //  }
       // console.log("-----------------------------------------------------------------------------")
       //  console.log(distancesTORay)
       //  // console.log(dist)
       //
       //  _geometry.computeVertexNormals();
       //
       //
       //  // for (const [index, _dragObject] of Object.entries(this.grabbedObjects)) {
       //  //     const position = _geometry.attributes.position;
       //  //     this.dragPlane.setFromNormalAndCoplanarPoint(this.dragPlaneNormal, _dragObject.point);
       //  //     this.brash.rayCaster.ray.intersectPlane(this.dragPlane, this.dragIntersection);
       //  //     _dragObject.object.worldToLocal(this.dragIntersection);
       //  //
       //  //     position.setXYZ(index, this.dragIntersection.x, this.dragIntersection.y, this.dragIntersection.z);
       //  //     position.needsUpdate = true;
       //  //
       //  // }
       //  // _geometry.computeVertexNormals();

    }

}