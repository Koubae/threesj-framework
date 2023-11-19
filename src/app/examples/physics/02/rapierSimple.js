import * as THREE from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import {Clock} from "three";

export default function demo() {
    import ("@dimforge/rapier3d").then(RAPIER => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x666666);

        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        const hemiLight = new THREE.HemisphereLight();
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 3);
        dirLight.position.set(5, 5, 5);
        dirLight.castShadow = true;
        dirLight.shadow.camera.zoom = 2;
        scene.add(dirLight);

        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(10, 5, 10),
            new THREE.ShadowMaterial({color: 0x444444})
        );
        floor.position.y = -2.5;
        floor.receiveShadow = true;
        floor.userData.physics = {mass: 0};
        scene.add(floor);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({color: 0x00ff00});
        const cube = new THREE.Mesh(geometry, material);
        cube.receiveShadow = true;
        cube.castShadow = true;
        cube.position.y = 1;
        scene.add(cube);

        const stats = new Stats();
        document.body.appendChild(stats.dom);

        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(-10, 10, 2);
        camera.lookAt(0, 0.5, 0);


        const controls = new OrbitControls(camera, renderer.domElement);
        controls.listenToKeyEvents(renderer.domElement);
        controls.enableDamping = true
        controls.enablePan = true
        controls.maxPolarAngle = Math.PI / 2 - 0.05 // prevent camera below ground
        controls.minPolarAngle = Math.PI / 4        // prevent top down view
        controls.update();

        // Physics
        let gravity = {x: 0.0, y: -9.81, z: 0.0};
        let world = new RAPIER.World(gravity);


        // Create the ground
        let groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0);
        world.createCollider(groundColliderDesc);

        // Add sphere
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshStandardMaterial({color: 0xffff00}));
        sphere.receiveShadow = true;
        sphere.castShadow = true;
        sphere.userData.physics = {mass: 1};
        scene.add(sphere);
        const sphereGeometry = sphere.geometry;
        const parameters = sphereGeometry.parameters;
        const radius = parameters.radius !== undefined ? parameters.radius : 1;
        const collider = RAPIER.ColliderDesc.ball(radius);

        // add physics to sphere
        const mass = 1;
        collider.setMass(mass);
        // collider.setRestitution(undefined);
        const desc = RAPIER.RigidBodyDesc.dynamic();
        desc.setTranslation( 10,  10,  1.0, );
        desc.setRotation( sphere.quaternion );
        const body = world.createRigidBody( desc );
        world.createCollider( collider, body );

        const clock = new Clock();
        function animate() {
            requestAnimationFrame(animate);

            // Ste the simulation forward.
            world.timestep = clock.getDelta();
            world.step();

            sphere.position.copy( body.translation() );
			sphere.quaternion.copy( body.rotation() );

            renderer.render(scene, camera);
            stats.update();
        }

        animate();


    });
}