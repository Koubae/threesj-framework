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
        }
    };
    const app = new App(appSettings);
    app.cameraMain.position.z = 10;
    app.cameraMain.position.z = 10;


    const THREE = App.lib.THREE;
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    app.scene.add(cube);

    function gameLoop(timestamp:  DOMHighResTimeStamp ) {
        // @ts-ignore
        let self = this;
        // Add your game logic here
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.01;
    }
    app.gameLoop = gameLoop;

    app.run();


}