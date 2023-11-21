import * as THREE from 'three';

import game from "../../../minimal";

export default function demo() {
    const {
        animate,
        camera,
        controls,
        renderer,
        scene,
        setGameLoop,
        loadTexture,
    } = game({color: "black", controls: true});
    camera.position.set(-20, 50, 30);

    function createTerrain() {
        const size = new THREE.Vector3(100, 1, 100);
        const segments = 10;
        const geometry = new THREE.PlaneGeometry(size.x, size.z, segments, segments);
        const ground = new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({
                color: 0x078215,
                side: THREE.FrontSide,
                wireframe: true,
            })
        );
        ground.rotateX(-Math.PI / 2);
        ground.receiveShadow = true;
        ground.castShadow = false;

        const points = new THREE.Points(geometry, new THREE.PointsMaterial({
            size: 2,
            color: "yellow"
        }));
        points.rotateX(-Math.PI / 2);
        scene.add(points);

        scene.add(ground);
        return [ground, points];
    }

    const [ground, points] = createTerrain();

    let drag = false;
    let intersection = null;
    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    ray.params.Points.threshold = 2;

    let plane = new THREE.Plane();
    let planeNormal = new THREE.Vector3();
    let planePoint = new THREE.Vector3();
    const div = document.createElement("div");


    window.addEventListener('mousedown', (event) => {
        updateRayCast(event);

        drag = true;

        const intersects = ray.intersectObject(points);
        if (!intersects.length) {
            intersection = null;
            return;
        }
        intersection = intersects[0];
        planeNormal.subVectors(camera.position, intersection.point).normalize();
        plane.setFromNormalAndCoplanarPoint(planeNormal, intersection.point);
    });
    window.addEventListener('mousemove', (event) => {
        if (!drag || !intersection) return;
        updateRayCast(event);

        ray.ray.intersectPlane(plane, planePoint);
        div.innerText = `currentIndex=${intersection.index}, planePoint=${planePoint.x}, ${planePoint.y}, ${planePoint.z}`;
        let posX = intersection.object.geometry.attributes.position.getX(intersection.index);
        let posY = intersection.object.geometry.attributes.position.getY(intersection.index);
        let posZ = intersection.object.geometry.attributes.position.getZ(intersection.index);
        // intersection.object.geometry.attributes.position.setX(intersection.index, posX+1);
        // intersection.object.geometry.attributes.position.setY(intersection.index, posY+1);
        intersection.object.geometry.attributes.position.setZ(intersection.index, posZ+1);
        // intersection.object.geometry.attributes.position.setXYZ(intersection.index, planePoint.x, planePoint.y, planePoint.z);
        intersection.object.geometry.attributes.position.needsUpdate = true;
        return;
        const object = intersection.object;
        const face = intersection.face;
        const faceIndex = intersection.faceIndex;
        // const i = intersection.index;
        const vertices = object.geometry.attributes.position.array;
        // vertices[(faceIndex * 3) + 1] += 1;
        // vertices[(faceIndex) + 1] += 1;
        // vertices[face.c] += 1;
        // console.log(i);

        object.geometry.attributes.position.setY(face.a, 10);
        object.geometry.attributes.position.needsUpdate = true;

        // object.geometry.computeVertexNormals();
        // object.geometry.verticesNeedUpdate = true;
        // object.geometry.normalsNeedUpdate = true;
        // object.geometry.colorsNeedUpdate  = true;

    });
    window.addEventListener('mouseup', (event) => {
        drag = true;
        intersection = null;
    });


    const updatePointer = (event) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    const updateRayCast = (event) => {
        updatePointer(event);
        ray.setFromCamera(pointer, camera);
    }

    setGameLoop((delta) => {

    });

    animate(0);

}