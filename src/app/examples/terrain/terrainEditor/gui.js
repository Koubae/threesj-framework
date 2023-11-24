import * as dat from 'dat.gui';

/**
 *
 * @type {import("./TerrainEditor.js").TerrainEditor} editor
 */
export default function gui(editor) {
    let gui = new dat.GUI({name: 'Terrain Editor'});

    const settings = {
        reset: function () {
            editor.terrain.scale.x = 1;
            editor.terrain.scale.y = 1;
            editor.terrain.scale.z = 1;
            editor.terrain.material.wireframe = false;
        }
    };
    gui.add(settings, 'reset');

    let folder_Plane = gui.addFolder('Plane');

    folder_Plane.add(editor.terrain.scale, 'x', 0, 1000).step(1).name('Width').listen();
    folder_Plane.add(editor.terrain.scale, 'y', 0, 1000).step(1).name('Length').listen();
    folder_Plane.add(editor.terrain.material, 'wireframe');
    folder_Plane.open();

    let folder_Camera = gui.addFolder("Camera");

    const cameraOriginalPosition = editor.camera.position.clone();

    settings["Reset Camera Position"] = () => {
        editor.camera.position.copy(cameraOriginalPosition);
        editor.camera.lookAt(0, 0, 0);

        editor.camera.updateMatrixWorld();
        editor.camera.updateProjectionMatrix();
    }
    folder_Camera.add(settings, 'Reset Camera Position');
    folder_Camera.add(editor.camera, 'far', 1, 10000).step(1).name("Distance").onChange(function () {
        editor.camera.updateMatrixWorld();
        editor.camera.updateProjectionMatrix();
    });

    let folder_Controls = gui.addFolder("Controls");

    const controlsDefaultSettings = {
        enableDamping: editor.controls.enableDamping,
        enablePan: editor.controls.enablePan,
        panSpeed: editor.controls.panSpeed,
        keyPanSpeed: editor.controls.keyPanSpeed,
        rotateSpeed: editor.controls.rotateSpeed,

        maxPolarAngle: editor.controls.maxPolarAngle,
        minPolarAngle: editor.controls.minPolarAngle
    }
    // The reset don't work very well, we need to reset somethign else because some values are broken after change
    settings["Reset Controls"] = () => {
        for (const [key, value] of Object.entries(controlsDefaultSettings)) {
            editor.controls[key] = value;
        }
    }
    folder_Controls.add(settings, 'Reset Controls');
    folder_Controls.add(editor.controls, 'enablePan');
    folder_Controls.add(editor.controls, 'panSpeed', 0, 50).step(0.1).name('Pan Speed');
    folder_Controls.add(editor.controls, 'keyPanSpeed', 0, 50).step(0.1).name('Key Pan Speed');

}