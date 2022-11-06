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
            fov: 40,
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
    function gameLoop(timestamp:  DOMHighResTimeStamp ) {
        // Add your game logic here


    }
    app.gameLoop = gameLoop;

    console.log(app);

    app.run();


}