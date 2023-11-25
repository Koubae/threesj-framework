import * as THREE from "three";
import game from "../../../minimal";
import gui from "./gui.js";
import Brash from "./Brash.js";

export default class TerrainEditor {
    TERRAIN_DEFAULT_SIZE = new THREE.Vector3(1000, 1, 1000);
    TERRAIN_DEFAULT_SEGMENTS = 50;

    constructor() {
        const gameBoot = game({color: "black", controls: true, freeFlight: true, controlsSettings: {keyPanSpeed: 14.0 * 4}});

        this.animate = gameBoot.animate;
        this.renderer = gameBoot.renderer;
        this.scene = gameBoot.scene;
        this.controls = gameBoot.controls;
        this.camera = gameBoot.camera;
        this.setGameLoop = gameBoot.setGameLoop;
        this.loadTexture = gameBoot.loadTexture;

        this.setGameLoop(this._gameLoop.bind(this, this._gameLoop));

        this._color = new THREE.Color();

        const [ground, points] = this.#createTerrain();

        this.terrain = ground;
        this.points = points;
        this.brash = new Brash(this,50);
        this.#setUP();

    }

    run() {
        this.animate(0);
    }

    _gameLoop(delta) {}

    #setUP() {
        this.camera.position.set(1, 300, 500);
        this.camera.lookAt(0, 0, 0);
        gui(this);
    }

    #createTerrain() {
        const geometry = new THREE.PlaneGeometry(
            this.TERRAIN_DEFAULT_SIZE.x,
            this.TERRAIN_DEFAULT_SIZE.z,
            this.TERRAIN_DEFAULT_SEGMENTS,
            this.TERRAIN_DEFAULT_SEGMENTS
        );
        const ground = new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({
                color: "green",
                side: THREE.FrontSide,
                wireframe: false,
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

        this.scene.add(points);
        this.scene.add(ground);
        return [ground, points];
    }

}