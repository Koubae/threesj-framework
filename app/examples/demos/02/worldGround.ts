import * as THREE from "three";

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
    app.cameraMain.position.set(0, 2, 2);
    app.cameraMain.lookAt(0, 0, 0);



    const geometry = new THREE.BoxGeometry( 1, 1, 1, 4, 4, 4);
    const material = new THREE.MeshStandardMaterial( { color: 0x00ff00, flatShading: true } );
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