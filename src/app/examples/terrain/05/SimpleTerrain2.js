import * as THREE from 'three';

import game from "../../../minimal";

export default async function demo() {
    const {
        animate,
        camera,
        controls,
        renderer,
        scene,
        setGameLoop,
        loadTexture,
    } = game();

    const manager = new THREE.LoadingManager();

    const assetFolder = "/assets/terrains";
    const terrainData = `${assetFolder}/jotunheimen.bin`;
    const response = await fetch(terrainData);
    let data = new Uint16Array(await response.arrayBuffer());

    function createTerrain() {
        let geometry = new THREE.PlaneGeometry(60, 60, 199, 199);
        let material = new THREE.MeshPhongMaterial({color: 0xdddddd,  wireframe: true});
        let ground = new THREE.Mesh(geometry, material);
        ground.rotateX(-Math.PI / 2);

        const vertices = ground.geometry.attributes.position.array;
        for (let i = 0, l = vertices.length; i < l; i++) {
            const value = data[i] / 65535 * 10;
            if (isNaN(value)) continue;
            vertices[i + 2] = value;
        }

        ground.geometry.computeVertexNormals();
        scene.add(ground);
    }

    createTerrain();


    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({color: 0x00ff00});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 10, 0);
    scene.add(cube);

    setGameLoop((delta) => {
    });

    animate(0);

}