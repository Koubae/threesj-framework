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



    function gameLoop(timestamp:  DOMHighResTimeStamp ) {
        // @ts-ignore
        let self = this;

    }
    app.gameLoop = gameLoop;
    app.run();


}