import * as dat from 'dat.gui';
import * as THREE from "three";

/**
 *
 * @type {import("./TerrainEditor.js").TerrainEditor} editor
 */
export default function gui(editor) {
    let gui = new dat.GUI({name: 'Terrain Editor', });

    const settings = {
        plane: {
            color: editor.terrain.material.color.getHex(),
            defaultColor: editor.terrain.material.color.getHex()
        },
        camera: {},
        controls: {}
    };

    let folder_Plane = gui.addFolder('Plane');
    settings["plane"]["Reset Plane"] = () => {
        editor.terrain.scale.x = 1;
        editor.terrain.scale.y = 1;
        editor.terrain.material.wireframe = false;
        editor.terrain.material.color.set(settings.plane.defaultColor)
    }
    folder_Plane.add(settings.plane, 'Reset Plane');
    folder_Plane.add(editor.terrain.scale, 'x', 0, 1000).step(1).name('Width').listen();
    folder_Plane.add(editor.terrain.scale, 'y', 0, 1000).step(1).name('Length').listen();
    folder_Plane.add(editor.terrain.material, 'wireframe');
    folder_Plane.addColor(settings.plane, 'color').name('Color').onChange(function () { editor.terrain.material.color.set(settings.plane.color)});
    folder_Plane.open();

    let folder_Camera = gui.addFolder("Camera");

    const cameraOriginalPosition = editor.camera.position.clone();

    settings["camera"]["Reset Camera Position"] = () => {
        editor.camera.position.copy(cameraOriginalPosition);
        editor.camera.lookAt(0, 0, 0);

        editor.camera.updateMatrixWorld();
        editor.camera.updateProjectionMatrix();
    }
    folder_Camera.add(settings.camera, 'Reset Camera Position');
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
    settings["controls"]["Reset Controls"] = () => {
        for (const [key, value] of Object.entries(controlsDefaultSettings)) {
            editor.controls[key] = value;
        }
    }
    folder_Controls.add(settings.controls, 'Reset Controls');
    folder_Controls.add(editor.controls, 'enablePan');
    folder_Controls.add(editor.controls, 'panSpeed', 0, 50).step(0.1).name('Pan Speed');
    folder_Controls.add(editor.controls, 'keyPanSpeed', 0, 50).step(0.1).name('Key Pan Speed');


    /**
     * This is not working very well
     */
    function updateGeometryFromThreeJSWebSite() {
        function updateGroupGeometry(mesh, geometry) {
            console.log(mesh);

            mesh.children.forEach(child => child.geometry.dispose());
            mesh.children[0].geometry = new THREE.WireframeGeometry(geometry);
            mesh.children[1].geometry = geometry;

        }

        const data = {
            width: 10,
            height: 10,
            widthSegments: 1,
            heightSegments: 1
        };

        function generateGeometry() {
            updateGroupGeometry(editor.terrain,
                new THREE.PlaneGeometry(
                    data.width, data.height, data.widthSegments, data.heightSegments
                )
            );
        }

        folder_Plane.add(data, 'width', 1, 30).onChange(generateGeometry);
        folder_Plane.add(data, 'height', 1, 30).onChange(generateGeometry);
        folder_Plane.add(data, 'widthSegments', 1, 30).step(1).onChange(generateGeometry);
        folder_Plane.add(data, 'heightSegments', 1, 30).step(1).onChange(generateGeometry);

    }

}