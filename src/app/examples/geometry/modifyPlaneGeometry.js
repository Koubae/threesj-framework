import * as THREE from 'three';

import {VertexNormalsHelper} from 'three/addons/helpers/VertexNormalsHelper.js';

import game from "../../minimal";
import {trianglePoint} from "./draggables.js";

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

    camera.position.set(1, 300, 500);
    camera.lookAt(0, 0, 0);

    const _color = new THREE.Color();

    function gridDotted(full = false) {
        const size = new THREE.Vector3(100, 1, 100);
        const segments = 10;
        const geometry = new THREE.PlaneGeometry(size.x, size.z, segments, segments);
        const ground = new THREE.Mesh(
            geometry,
            new THREE.MeshPhongMaterial({
                color: "red",
                side: THREE.FrontSide,
                wireframe: !full,
            })
        );
        ground.rotateX(-Math.PI / 2);
        ground.receiveShadow = true;
        ground.castShadow = true;

        const pointSize = 1;
        const points = new THREE.Points(geometry, new THREE.PointsMaterial({
            size: pointSize,
            color: "yellow"
        }));
        points.rotateX(-Math.PI / 2);
        scene.add(points);
        // ground.add(points);
        scene.add(ground);

        const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({color: 0x00ff00}))
        const cubeRed = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({color: "red"}))
        scene.add(cube);
        scene.add(cubeRed);

        trianglePoint(scene, camera, controls, -25, cubeRed);


        // Set up Dragging functionallity
        const DRAG_ALL_FIGURE = false;
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
        rayCaster.params.Points.threshold = pointSize;

        const updateRayCasting = (event) => {
            pointerUpdate(event);
            rayCaster.setFromCamera(pointer, camera);
        }
        let drag = false;
        let dragObject = null;
        document.addEventListener('pointerdown', (event) => {
            updateRayCasting(event);
            const intersects = rayCaster.intersectObject(points, false);  // if set recursive true, we could get also independently the LineSegments!
            if (!intersects.length) return;

            controls.enabled = false;
            drag = true;
            dragObject = intersects[0];
            dragPoint.copy(dragObject.point);

            // To move it in 3D depending on camera position (top,bottom etc..)
            dragPlaneNormal.subVectors(camera.position, dragPoint).normalize();  //Change direction based on camera
            dragPlane.setFromNormalAndCoplanarPoint(dragPlaneNormal, dragPoint);
            dragShift.subVectors(dragObject.object.position, dragPoint);

        });
        document.addEventListener('pointerup', (event) => {
            drag = false;
            dragObject = null;
            controls.enabled = true;
        });
        document.addEventListener('pointermove', (event) => {
            if (!drag || !dragObject) return;

            updateRayCasting(event);

            const _geometry = dragObject.object.geometry;
            const position = _geometry.attributes.position;
            const index = dragObject.index;
            rayCaster.ray.intersectPlane(dragPlane, dragIntersection);
            if (DRAG_ALL_FIGURE) {
                dragObject.object.position.addVectors(dragIntersection, dragShift);
                return;
            }
            cube.position.addVectors(dragIntersection, dragShift);
            dragObject.object.worldToLocal(dragIntersection);
            position.setXYZ(index, dragIntersection.x, dragIntersection.y, dragIntersection.z);
            position.needsUpdate = true;
            _geometry.computeVertexNormals();

        });
    }

    function gridExpands(full = false) {
        const size = new THREE.Vector3(1000, 1, 1000);
        const segments = 50;
        const geometry = new THREE.PlaneGeometry(size.x, size.z, segments, segments);
        const ground = new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({
                color: "green",
                side: THREE.FrontSide,
                wireframe: !full,
            })
        );
        ground.rotateX(-Math.PI / 2);
        ground.receiveShadow = true;
        ground.castShadow = false;

        const pointSize = 2;
        const points = new THREE.Points(geometry, new THREE.PointsMaterial({
            size: pointSize,
            color: "yellow"
        }));
        points.rotateX(-Math.PI / 2);

        scene.add(points);
        scene.add(ground);

        const cubeRed = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshLambertMaterial({color: "red"}))
        cubeRed.position.setY(-11);
        scene.add(cubeRed);

        const brashSize = 50;
        const pointerCircle = new THREE.Mesh(
            new THREE.CircleGeometry(brashSize, 32),
            new THREE.MeshLambertMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide,
                wireframe: false,
                reflectivity: 1,
                emissive: "yellow"
            })
        );
        pointerCircle.rotateX(-Math.PI / 2);

        const pointerLight = new THREE.PointLight("yellow", 100);
        pointerLight.castShadow = true; // Expensive!!!
        pointerLight.power = 50;
        pointerLight.decay = 1;

        pointerCircle.add(pointerLight);

        scene.add(pointerCircle);


        const DRAG_ALL_FIGURE = false;
        const dragPlane = new THREE.Plane();

        const dragPlaneNormal = new THREE.Vector3(0, 1, 0);
        const dragIntersection = new THREE.Vector3();
        const dragPoint = new THREE.Vector3();
        const dragShift = new THREE.Vector3();
        const pointer = new THREE.Vector2();

        // Pointer Ray
        const pointerPlaneNormal = new THREE.Vector3(0, 1, 0);
        const pointerPlane = new THREE.Plane(pointerPlaneNormal);
        const pointerIntersection = new THREE.Vector3();
        const pointerShift = new THREE.Vector3();

        const pointerUpdate = (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
        const rayCaster = new THREE.Raycaster();
        // rayCaster.params.Points.threshold = pointSize;
        rayCaster.params.Points.threshold = brashSize;

        const updateRayCasting = (event) => {
            pointerUpdate(event);
            rayCaster.setFromCamera(pointer, camera);
        }
        const HIGH_PEAK = true;
        let drag = false;
        let dragObject = null;
        /** @type {Object|null} */
        let dragObjects = null;
        document.addEventListener('pointerdown', (event) => {
            updateRayCasting(event);

            const intersects = rayCaster.intersectObject(points, false);  // if set recursive true, we could get also independently the LineSegments!
            if (!intersects.length) return;

            controls.enabled = false;
            drag = true;
            dragObject = intersects[0];
            dragObjects = {};
            intersects.forEach(dragObject => {
                if (dragObject.index && !(dragObject.index in dragObjects)) dragObjects[dragObject.index] = dragObject;
            });

            dragPoint.copy(dragObject.point);
            // To move it in 3D depending on camera position (top,bottom etc..)
            dragPlaneNormal.subVectors(camera.position, dragPoint).normalize();  //Change direction based on camera
            if (HIGH_PEAK) {
                // we set the drag plane here already! The first object is the actual center point. The mountain peak will be at the center of pointer
                dragPlane.setFromNormalAndCoplanarPoint(dragPlaneNormal, dragPoint);
            }

            dragShift.subVectors(dragObject.object.position, dragPoint);

        });
        document.addEventListener('pointerup', (event) => {
            drag = false;
            dragObject = null;
            dragObjects = null;
            controls.enabled = true;
        });
        document.addEventListener('pointermove', (event) => {
            updateRayCasting(event);

            rayCaster.ray.intersectPlane(pointerPlane, pointerIntersection);
            pointerCircle.position.addVectors(pointerIntersection, pointerShift);

            if (!drag || !dragObject) return;

            const _geometry = dragObject.object.geometry;
            if (HIGH_PEAK) {
                // Setting high point one that is the same
                rayCaster.ray.intersectPlane(dragPlane, dragIntersection);
                dragObject.object.worldToLocal(dragIntersection);
            }

            for (const [index, _dragObject] of Object.entries(dragObjects)) {
                const position = _geometry.attributes.position;
                if (!HIGH_PEAK) {
                    dragPlane.setFromNormalAndCoplanarPoint(dragPlaneNormal, _dragObject.point);
                    rayCaster.ray.intersectPlane(dragPlane, dragIntersection);
                    _dragObject.object.worldToLocal(dragIntersection);
                }

                position.setXYZ(index, dragIntersection.x, dragIntersection.y, dragIntersection.z);
                position.needsUpdate = true;

            }
            _geometry.computeVertexNormals();
            console.info(_geometry.attributes.position.array);
        });

    }

    // gridDotted(false);
    gridExpands(true);


    setGameLoop((delta) => {

    });

    animate(0);

}