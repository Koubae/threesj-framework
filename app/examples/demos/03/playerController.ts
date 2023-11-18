import * as THREE from "three";

import Player from "../../../entities/player.js";

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
        sceneMain: {
        },
        world: {
            scene: {
                background: 0xADD8E6FF, // add texture
                backgroundTesting: false,
                fogEnabled: true,
                fogType: 1,
                fog: {
                    type1: {
                        color: 0xADD8E6FF,
                        near: 0.01,
                        far: 500
                    },
                    type2: {
                        color: 0xADE6D5FF,
                        density: 0.01,
                    }
                }
            },
            debug: true,
            ground: {
                size: new THREE.Vector2(1000, 1000),
                side: THREE.DoubleSide,
                helper: true,
            }
        }
    };
    const app = new App(appSettings);
    app.cameraMain.position.set(0, 15, 20 );
    app.cameraMain.lookAt(0, 0, 0);



    const geometry = new THREE.BoxGeometry( 1, 1, 1, 4, 4, 4);
    const material = new THREE.MeshStandardMaterial( { color: 0x00ff00, flatShading: true } );
    const playerMesh = new THREE.Mesh( geometry, material );
    playerMesh.position.y = playerMesh.geometry.parameters.width / 2; // put the cube on top of ground (y=0)
    playerMesh.castShadow = true;
    app.scene.add(playerMesh);

    let eventManager = app.eventManager;
    let userInput = eventManager.userInput;

    // Create A player
    const player = new Player(playerMesh, userInput);

    function gameLoop(timestamp:  DOMHighResTimeStamp ) {
        // @ts-ignore
        let self = this;
        player.update(self.timestampDelta);



    }
    app.gameLoop = gameLoop;
    app.run();


}