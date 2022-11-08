import * as THREE from "three";
import Player from "../../../entities/player.js";
import Entity from "../../../entities/entity.js";

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
            controls: false,
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

    let eventManager = app.eventManager;
    let userInput = eventManager.userInput;

    // Create A player
    const geometry = new THREE.BoxGeometry( 1, 1, 1, 4, 4, 4);
    const material = new THREE.MeshStandardMaterial( { color: 0x00ff00, flatShading: true } );
    const playerMesh = new THREE.Mesh( geometry, material );

    const player = new Player(playerMesh, userInput);
    app.addPlayer(player, "thirdPerson");

    // Create entity
    const materialEntity = new THREE.MeshStandardMaterial( { color: 0xff0000, flatShading: true } );

    let entities: Entity[] = [];
    let entityCount = 6;
    for (let i = 0; i < entityCount; i++) {
        const entityMesh = new THREE.Mesh( geometry, materialEntity );
        const entity = new Entity(entityMesh, userInput);
        //entity.mesh.position.x = (i + .5) * 5;

        entity.mesh.rotation.y += Math.cos(i + .5) * 2;
        entity.mesh.position.x = Math.cos((i + .5)) * 5;
        entity.mesh.position.z = Math.sin((i + .5)) * 5;

        //entity.mesh.position.z = (i + 5) * 5;
        app.addEntity(entity);
        entities.push(entity);
    }

    function gameLoop(timestamp:  DOMHighResTimeStamp ) {
        // @ts-ignore
        let self = this;
        player.update(self.timestampDelta);

        entities.forEach((entity: any) => {
           entity.update(self.timestampDelta);
        });

    }
    app.gameLoop = gameLoop;
    app.run();


}