import * as THREE from "three";
import {Light} from "three/src/lights/Light";

export default function demo(App: any) {
    const appSettings: {[key: string]: any} = {
        renderer: {
            antialias: true,
            encoding: "rgb",
            shadowMap: true,
            shadowMapType: "soft",
        },
        cameraSettings: {
            cameraType: "perspective",
            fov: 75,
            aspect: window.innerWidth / window.innerHeight,
            near: 0.1,
            far: 1000,

            // other
            controls: true,
        },
        scene: {
            background: 0x000000,
        },
        world: {
            debug: true,
        }
    };
    const app = new App(appSettings);
    app.cameraMain.position.set(0, 2, 2);
    app.cameraMain.lookAt(0, 0, 0);

    const components = App.lib.components;
    const ground = new components.GroundFlat(app.scene, {
        size: new THREE.Vector2(100, 100),
        side: THREE.DoubleSide,
        helper: true,
    });



    const geometry = new THREE.BoxGeometry( 1, 1, 1, 4, 4, 4);
    const material = new THREE.MeshLambertMaterial( { color: 0x00ff00, flatShading: true } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.y = cube.geometry.parameters.width / 2; // put the cube on top of ground (y=0)

    cube.castShadow = true;
    app.scene.add(cube);

    function gameLoop(timestamp:  DOMHighResTimeStamp ) {
        // @ts-ignore
        let self = this;


    }
    app.gameLoop = gameLoop;
    app.run();


}