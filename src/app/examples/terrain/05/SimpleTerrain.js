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
    } = game();

    function createTerrain() {
        let scale = new THREE.Vector3(70.0, 5.0, 70.0);
        let subDivisions = 20;
        const texturePath = "/assets/textures/grass";

        const threeFloor = new THREE.Mesh(
            new THREE.PlaneGeometry(scale.x, scale.z, subDivisions, subDivisions),
            new THREE.MeshStandardMaterial({
                map: loadTexture(`${texturePath}/Grass_005_BaseColor.jpg`),
                normalMap: loadTexture(`${texturePath}/Grass_005_Normal.jpg`),
                aoMap: loadTexture(`${texturePath}/Grass_005_AmbientOcclusion.jpg`),
                roughnessMap: loadTexture(`${texturePath}/Grass_005_Roughness.jpg`),
                roughness: 0.6
            })
        );
        threeFloor.rotateX(-Math.PI / 2);
        threeFloor.receiveShadow = true;
        threeFloor.castShadow = true;
        scene.add(threeFloor);

        // Create Height - Map
        const vertices = threeFloor.geometry.attributes.position.array;
        const dx = scale.x / subDivisions;
        const dy = scale.z / subDivisions;
        // store height data in map column-row map
        const tableMapping = new Map();
        for (let i = 0; i < vertices.length; i += 3) {
            // translate into colum / row indices
            let row = Math.floor(Math.abs(vertices[i] + (scale.x / 2)) / dx);
            let column = Math.floor(Math.abs(vertices[i + 1] - (scale.z / 2)) / dy);
            // generate height for this column & row
            const randomHeight = Math.random();
            vertices[i + 2] = scale.y * randomHeight;
            // store height
            if (!tableMapping.get(column)) {
                tableMapping.set(column, new Map());
            }
            tableMapping.get(column).set(row, randomHeight);
        }
        threeFloor.geometry.computeVertexNormals();


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