import * as THREE from 'three';
import {Mesh, Scene} from "three";


export default class GroundFlat { // todo make component interface + component class

    public scene: Scene;
    public mesh: Mesh;
    constructor(scene: THREE.Scene, settings: {[key: string]: any} = {}) {
        this.scene = scene;

        const size = settings.size ? settings.size : new THREE.Vector2(100, 100);
        const color = settings.color ? settings.color : 0x202020;
        const side = settings.side ? settings.side : THREE.FrontSide;

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(size.x, size.y, 1, 1),
            new THREE.MeshLambertMaterial({
                color: color,
                side: side,
            })
        )

        this.mesh.castShadow = false;
        this.mesh.receiveShadow = true;
        this.mesh.rotation.x = -Math.PI * .5; // rotate 180
        this.scene.add(this.mesh);

        // If helper is set, it creates a ground grid
        if ("helper" in  settings && settings.helper) {
            // grid
            const gridHelper = new THREE.GridHelper( size.x, size.x );
            this.scene.add( gridHelper );
        }

    }

}