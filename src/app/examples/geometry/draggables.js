import * as THREE from "three";
import {VertexNormalsHelper} from 'three/addons/helpers/VertexNormalsHelper.js';
import {Vector2} from "three";


const _color = new THREE.Color();


export function trianglePoint(scene, camera, controls, push = 0, cube = null) {
    // colors
    _color.setRGB(2, 220, 5);
    const pointSize = 2;
    const [triangle, points] = createSimpleTriangle(scene, push, pointSize);
    const rayCaster = new THREE.Raycaster();
    rayCaster.params.Points.threshold = pointSize;

    const pointer = new Vector2();
    let dragging = false;
    let pointHook = null;

    let plane = new THREE.Plane();
    let pNormal = new THREE.Vector3(0, 1, 0); // plane's normal
    let planeIntersect = new THREE.Vector3(); // point of intersection with the plane
    let shift = new THREE.Vector3();

    const pointerUpdate = (event) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    const updateRayCasting = (event) => {
        pointerUpdate(event);
        rayCaster.setFromCamera(pointer, camera);
    }

    window.addEventListener('mousedown', event => {
        event.preventDefault();
        event.stopPropagation();
        updateRayCasting(event);
        const intersects = rayCaster.intersectObject(points, false);   // if set recursive true, we could get also independently the LineSegments!
        if (!intersects.length) return;

        controls.enabled = false;
        dragging = true;

        pointHook = intersects[0];

        pNormal.subVectors(camera.position, pointHook.point).normalize();  //Change direction based on camera
        shift.subVectors(pointHook.object.position, pointHook.point);
        plane.setFromNormalAndCoplanarPoint(pNormal, pointHook.point);

    });
    window.addEventListener('mouseup', event => {
        event.preventDefault();
        event.stopPropagation();

        dragging = false;
        pointHook = null;
        controls.enabled = true;
    });
    window.addEventListener('mousemove', event => {
        if (!dragging || !pointHook) return;
        event.preventDefault();
        event.stopPropagation();
        updateRayCasting(event);

        const position = pointHook.object.geometry.attributes.position;
        const index = pointHook.index;
        rayCaster.ray.intersectPlane(plane, planeIntersect);
        position.setXYZ(index, planeIntersect.x, planeIntersect.y, planeIntersect.z);
        position.needsUpdate = true;
        if (cube) {
             cube.position.addVectors(planeIntersect, shift);
        }

    });
}


function createSimpleTriangle(scene, push = 0, pointSize = 2) {
    const triangle = new THREE.Triangle(
        new THREE.Vector3(-10 + push, -2, 3),
        new THREE.Vector3(2 + push, 10, 3),
        new THREE.Vector3(10 + push, -2, 3)
    );

    const vertices = 3;  // Triangle ;)
    const positions = new Float32Array(vertices * 3);
    const normals = new Float32Array(vertices * 3);
    const colors = new Float32Array(vertices * 3);

    triangle.a.toArray(positions);
    triangle.b.toArray(positions, 3);
    triangle.c.toArray(positions, 6);

    const normal = triangle.getNormal(new THREE.Vector3());
    normal.toArray(normals);
    normal.toArray(normals, 3);
    normal.toArray(normals, 6);

    for (let i = 0; i < positions.length; i += 3) {
        colors[i] = _color.r;
        colors[i + 1] = _color.g;
        colors[i + 2] = _color.b;
    }

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();

    let material = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
        side: THREE.DoubleSide, vertexColors: true
    });

    let mesh = new THREE.Mesh(geometry, material);
    const helper = new VertexNormalsHelper(mesh, 5, 0xffff00);

    // Add points
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({
        size: pointSize,
        color: "red"
    }));

    mesh.add(helper);
    mesh.add(points);

    scene.add(mesh);
    return [mesh, points];
}