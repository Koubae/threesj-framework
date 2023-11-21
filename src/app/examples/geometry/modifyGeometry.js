import * as THREE from 'three';

import {VertexNormalsHelper} from 'three/addons/helpers/VertexNormalsHelper.js';

import game from "../../minimal";
import {Vector2} from "three";

export default function demo() {
    const {
        animate,
        camera,
        controls,
        renderer,
        scene,
        setGameLoop,
        loadTexture,
    } = game({color: "black", controls: true, freeFlight: true});
    const axesHelper = new THREE.AxesHelper(10);  // The X axis is red. The Y axis is green. The Z axis is blue.
    scene.add(axesHelper);

    camera.position.set(0, 0, 40);
    camera.lookAt(0, 0, 0);

    const _color = new THREE.Color();

    function createSimpleTriangle(push = 0) {
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
            size: 2,
            color: "red"
        }));

        mesh.add(helper);
        mesh.add(points);

        scene.add(mesh);
        return [mesh, points];
    }

    /**
     * https://discourse.threejs.org/t/dragging-3d-objects-using-mouse-in-three-js/12731/2
     */
    function triangleChangePositionByPoint() {
        // colors
        _color.setRGB(2, 220, 5);
        const [triangle, points] = createSimpleTriangle(-25);
        const rayCaster = new THREE.Raycaster();
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

        });

    }

    function ChangePositionByPointAllFigure() {
        // colors
        _color.setRGB(3, 25, 63);
        const [triangle, points] = createSimpleTriangle(25);
        const rayCaster = new THREE.Raycaster();
        const pointer = new Vector2();
        let dragging = false;
        let intersect = null;

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
            const intersects = rayCaster.intersectObject(triangle, false);   // if set recursive true, we could get also independently the LineSegments!
            if (!intersects.length) return;

            controls.enabled = false;
            dragging = true;

            intersect = intersects[0];

            pNormal.subVectors(camera.position, intersect.point).normalize();  //Change direction based on camera
            shift.subVectors(intersect.object.position, intersect.point);
            plane.setFromNormalAndCoplanarPoint(pNormal, intersect.point);

        });
        window.addEventListener('mouseup', event => {
            event.preventDefault();
            event.stopPropagation();

            dragging = false;
            intersect = null;
            controls.enabled = true;
        });
        window.addEventListener('mousemove', event => {
            if (!dragging || !intersect) return;
            event.preventDefault();
            event.stopPropagation();

            updateRayCasting(event);

            rayCaster.ray.intersectPlane(plane, planeIntersect);
            intersect.object.position.addVectors(planeIntersect, shift);

        });
    }

    /**
     * https://discourse.threejs.org/t/dragging-3d-objects-using-mouse-in-three-js/12731/2
     * https://jsfiddle.net/xa9uscme/1/
     */
    function pyramidMoveOnAPlane() {
        scene.add(new THREE.GridHelper(100, 100));

        // Create Pyramid
        const height = 5;
        const geometry = new THREE.ConeGeometry(5, height, 4);
        const material = new THREE.MeshPhongMaterial({color: "red"});
        const pyramid = new THREE.Mesh(geometry, material);
        geometry.translate(0, height * 0.5, 0);

        // edges
        let pyramidEdges = new THREE.EdgesGeometry(geometry);
        let edges = new THREE.LineSegments(pyramidEdges, new THREE.LineBasicMaterial({color: "orange"}));
        pyramid.add(edges);
        scene.add(pyramid);

        // Set up Dragging functionallity
        const dragPlane = new THREE.Plane();
        const dragPlaneNormal = new THREE.Vector3(0, 1, 0);
        const dragIntersection = new THREE.Vector3();
        const dragPoint = new THREE.Vector3();
        const dragShift = new THREE.Vector3();
        const pointer = new THREE.Vector2();
        const pointerUpdate = (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
        const rayCaster = new THREE.Raycaster();
        const updateRayCasting = (event) => {
            pointerUpdate(event);
            rayCaster.setFromCamera(pointer, camera);
        }

        let drag = false;
        let dragObject = null;

        document.addEventListener('pointerdown', (event) => {
            updateRayCasting(event);
            const intersects = rayCaster.intersectObject(pyramid, false);  // if set recursive true, we could get also independently the LineSegments!
            if (!intersects.length) return;

            controls.enabled = false;
            drag = true;
            dragObject = intersects[0];
            dragPoint.copy(dragObject.point);

            // To move it in 3D depending on camera position (top,bottom etc..)
            // dragPlaneNormal.subVectors(camera.position, dragObject.point).normalize();  //Change direction based on camera
            dragPlane.setFromNormalAndCoplanarPoint(dragPlaneNormal, dragPoint);
            dragShift.subVectors(dragObject.object.position, dragObject.point);

        });
        document.addEventListener('pointerup', (event) => {
            drag = false;
            dragObject = null;
            controls.enabled = true;
        });
        document.addEventListener('pointermove', (event) => {
            if (!drag || !dragObject) return;

            updateRayCasting(event);

            rayCaster.ray.intersectPlane(dragPlane, dragIntersection);
            dragObject.object.position.addVectors(dragIntersection, dragShift);
        });


    }


    triangleChangePositionByPoint();
    ChangePositionByPointAllFigure();
    pyramidMoveOnAPlane();


    setGameLoop((delta) => {

    });

    animate(0);

}