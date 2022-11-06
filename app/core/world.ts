import * as THREE from 'three';
import {AmbientLight, DirectionalLight, HemisphereLight, Scene} from "three";
import GroundFlat from "../components/world/GroundFlat.js";

const LIGHT_HEMISPHERE_COLORS = {
    natural: {
        sky: 0xd5f4ee,
        ground: 0x86724c,
        intensity: .3
    },
    blue: {
        sky: 0x0000ff,
        ground: 0x00ff00,
        intensity: .3
    },
}

export default class World {
    // ----------------- < PUBLIC > ----------------- \\
    public scene: Scene;
    public lights: THREE.Light[] = [];
    public ground: GroundFlat;
    public debug: boolean = false;
    // ----------------- < PRIVATE > ----------------- \\
    #settings: {[key: string]: any} = {}

    constructor(scene: Scene, settings: {[key: string]: any} = {}) {
        this.scene = scene;
        this.#settings = settings;
        this.debug = "debug" in settings && settings.debug || this.debug;

        this.#loadWorldLight();
        this.#loadWorldGround();

    }

    #loadWorldLight() {
        // Add Default Ambient Light
        this.addLight(
            new THREE.AmbientLight(0x404040, 1)
        );
        // Add Default Sky Light 0xd5f4ee, 0x86724c
        const hemisphereColor = LIGHT_HEMISPHERE_COLORS.natural;
        const hemisphereLight = new THREE.HemisphereLight(
            hemisphereColor.sky,
            hemisphereColor.ground,
            hemisphereColor.intensity
        );
        hemisphereLight.position.set( 0, 100, 0 );
        // TODO: Check how to implement proper HSL
        //hemisphereLight.color.setHSL( 0.5, 1, 0.6 );
        //hemisphereLight.groundColor.setHSL( 0.1, 1, 0.75 );
        this.addLight(
            hemisphereLight
        );

        // Add Sun light
        let sunLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        sunLight.position.set(55, 100, 50);
        sunLight.target.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.bias = -0.001;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 3500.0;
        sunLight.shadow.camera.left = 100;
        sunLight.shadow.camera.right = -100;
        sunLight.shadow.camera.top = 100;
        sunLight.shadow.camera.bottom = -100;
        this.addLight(
            sunLight
        );
    }

    #loadWorldGround() {
        let settings = this.#settings.ground;
        if (!settings) settings = {};
        const size = settings.size ? settings.size : new THREE.Vector2(100, 100);
        const side = settings.side ? settings.side : THREE.FrontSide;
        const helper = settings.helper ? settings.helper : false;
        this.ground = new GroundFlat(this.scene, {
            size: size,
            side: side,
            helper: helper,
        });
    }

    // ---------------------------
    //  HELPERS
    // ---------------------------
    addLight(light: HemisphereLight|AmbientLight|DirectionalLight) {

        if (this.debug) {
            if (light instanceof HemisphereLight) {
                this.scene.add(new THREE.HemisphereLightHelper(light, 10));
            } else if (light instanceof AmbientLight) {
                // do nothing
            } else if (light instanceof DirectionalLight) {
                this.scene.add(new THREE.DirectionalLightHelper( light, 10 ));
            } else {
                // do nothing
            }

        }

        this.scene.add(light);
        this.lights.push(light);
    }
}