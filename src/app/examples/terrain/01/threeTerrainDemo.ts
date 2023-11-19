import * as THREE from "three";

// window.THREE = THREE;
// import * as terrain from "three.terrain.js/build/THREE.Terrain";

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
        }
    };
    const app = new App(appSettings);
    app.cameraMain.position.set(0, 15, 20 );
    app.cameraMain.lookAt(0, 0, 0);

    function buildTree() {
        var green = new THREE.MeshLambertMaterial({ color: 0x2d4c1e });

        var c0 = new THREE.Mesh(
            new THREE.CylinderGeometry(2, 2, 12, 6, 1, true),
            new THREE.MeshLambertMaterial({ color: 0x3d2817 }) // brown
        );
        c0.position.setY(6);

        var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 14, 8), green);
        c1.position.setY(18);
        var c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 13, 8), green);
        c2.position.setY(25);
        var c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 12, 8), green);
        c3.position.setY(32);

        var s = new THREE.Object3D();
        s.add(c0);
        s.add(c1);
        s.add(c2);
        s.add(c3);
        s.scale.set(5, 1.25, 5);

        return s;
    }

    let tree = buildTree();
     // app.addEntity(tree);
     app.scene.add(tree);

    function gameLoop(timestamp:  DOMHighResTimeStamp ) {
        // @ts-ignore
        let self = this;

    }
    app.gameLoop = gameLoop;
    app.run();

}