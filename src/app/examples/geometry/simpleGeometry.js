import * as THREE from 'three';

import {VertexNormalsHelper} from 'three/addons/helpers/VertexNormalsHelper.js';

import game from "../../minimal";

export default function demo() {
    const {
        animate,
        camera,
        controls,
        renderer,
        scene,
        setGameLoop,
        loadTexture,
    } = game({color: "black", controls: true, freeFlight: true});
    const axesHelper = new THREE.AxesHelper(10);  // The X axis is red. The Y axis is green. The Z axis is blue.
    scene.add(axesHelper);

    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    const helper = new THREE.DirectionalLightHelper(light1, 5);

    light1.position.set(0, 15, 0);
    scene.add(light1);
    scene.add(helper);

    const _color = new THREE.Color();

    function geometrySimple() {
        const geometry = new THREE.BufferGeometry();

        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.
        const vertices = new Float32Array([
            -1.0, -1.0, 1.0, // v0
            1.0, -1.0, 1.0, // v1
            1.0, 1.0, 1.0, // v2

            1.0, 1.0, 1.0, // v3
            -1.0, 1.0, 1.0, // v4
            -1.0, -1.0, 1.0  // v5
        ]);

        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const material = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

    }

    function geometryIndex() {
        const geometry = new THREE.BufferGeometry();

        // All unique vertices of a polygon
        const vertices = new Float32Array([
            -1.0, -1.0, 1.0,    // bottom-left
            1.0, -1.0, 1.0,     // bottom-right
            1.0, 1.0, 1.0,      // top-right
            -1.0, 1.0, 1.0,     // top-left
        ]);

        // This represent a triangle indices mapping
        const indices = [
            // triangle 1
            0, 1, 2,
            // triangle 2
            2, 3, 0,
        ];

        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const material = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    function geometrySimpleModified() {
        const geometry = new THREE.BufferGeometry();

        const positionZ = 1.0;
        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.
        const vertices = new Float32Array([
            // ------------- TRIANGLE 1 ------------- \\
            -1.0, -1.0, positionZ,      // bottom-left
            1.0, -1.0, positionZ,       // bottom-right
            1.0, 1.0, positionZ,        // top-right

            // ------------- TRIANGLE 2 ------------- \\
            1.0, 1.0, positionZ,        // top-right
            -1.0, 1.0, positionZ,       // top-left
            -1.0, -1.0, positionZ       // bottom-left
        ]);

        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const material = new THREE.MeshBasicMaterial({vertexColors: true, side: THREE.DoubleSide, flatShading: true,});
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

    }

    function cube() {
        const geometry = new THREE.BufferGeometry();

        const _color = new THREE.Color();
        const positionXCube = new THREE.Vector2(-1.0, 1.0);
        const positionYCube = new THREE.Vector2(-1.0, 1.0);
        const positionZCube = new THREE.Vector2(1.0, 3.0);

        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.

        const faceVertical1 = [
            // ------------- TRIANGLE 1 ------------- \\
            positionXCube.x, positionYCube.x, positionZCube.x,      // bottom-left
            positionXCube.y, positionYCube.x, positionZCube.x,       // bottom-right
            positionXCube.y, positionYCube.y, positionZCube.x,        // top-right

            // ------------- TRIANGLE 2 ------------- \\
            positionXCube.y, positionYCube.y, positionZCube.x,        // top-right
            positionXCube.x, positionYCube.y, positionZCube.x,       // top-left
            positionXCube.x, positionYCube.x, positionZCube.x       // bottom-left
        ];
        const faceVertical2 = [
            // ------------- TRIANGLE 1 ------------- \\
            positionXCube.y, positionYCube.x, positionZCube.x,      // bottom-left
            positionXCube.y, positionYCube.x, positionZCube.y,       // bottom-right
            positionXCube.y, positionYCube.y, positionZCube.y,        // top-right

            // ------------- TRIANGLE 2 ------------- \\
            positionXCube.y, positionYCube.y, positionZCube.y,        // top-right
            positionXCube.y, positionYCube.y, positionZCube.x,       // top-left
            positionXCube.y, positionYCube.x, positionZCube.x       // bottom-left
        ];

        const faceVertical3 = [
            // ------------- TRIANGLE 1 ------------- \\
            positionXCube.x, positionYCube.x, positionZCube.y,      // bottom-left
            positionXCube.y, positionYCube.x, positionZCube.y,       // bottom-right
            positionXCube.y, positionYCube.y, positionZCube.y,        // top-right

            // ------------- TRIANGLE 2 ------------- \\
            positionXCube.y, positionYCube.y, positionZCube.y,        // top-right
            positionXCube.x, positionYCube.y, positionZCube.y,       // top-left
            positionXCube.x, positionYCube.x, positionZCube.y      // bottom-left
        ];

        const faceVertical4 = [
            // ------------- TRIANGLE 1 ------------- \\
            positionXCube.x, positionYCube.x, positionZCube.x,      // bottom-left
            positionXCube.x, positionYCube.x, positionZCube.y,       // bottom-right
            positionXCube.x, positionYCube.y, positionZCube.y,        // top-right

            // ------------- TRIANGLE 2 ------------- \\
            positionXCube.x, positionYCube.y, positionZCube.y,        // top-right
            positionXCube.x, positionYCube.y, positionZCube.x,       // top-left
            positionXCube.x, positionYCube.x, positionZCube.x       // bottom-left
        ];

        const faceTop = [
            // ------------- TRIANGLE 1 ------------- \\
            positionXCube.x, positionYCube.y, positionZCube.x,      // bottom-left
            positionXCube.y, positionYCube.y, positionZCube.x,       // bottom-right
            positionXCube.y, positionYCube.y, positionZCube.y,        // top-right

            // ------------- TRIANGLE 2 ------------- \\
            positionXCube.y, positionYCube.y, positionZCube.y,        // top-right
            positionXCube.x, positionYCube.y, positionZCube.y,        // top-right
            positionXCube.x, positionYCube.y, positionZCube.x,        // top-right

        ];

        const faceBottom = [
            // ------------- TRIANGLE 1 ------------- \\
            positionXCube.x, positionYCube.x, positionZCube.x,      // bottom-left
            positionXCube.y, positionYCube.x, positionZCube.x,       // bottom-right
            positionXCube.y, positionYCube.x, positionZCube.y,        // top-right

            // ------------- TRIANGLE 2 ------------- \\
            positionXCube.y, positionYCube.x, positionZCube.y,        // top-right
            positionXCube.x, positionYCube.x, positionZCube.y,        // top-right
            positionXCube.x, positionYCube.x, positionZCube.x,        // top-right

        ];

        const verticesCoordinates = faceVertical1.concat(faceVertical2, faceVertical3, faceVertical4, faceTop, faceBottom);
        const vertices = new Float32Array(verticesCoordinates);

        const color = new THREE.Color();
        const colors = [];
        for (let i = 0; i < verticesCoordinates.count; i += 6) {

            color.setHex(0xffffff * Math.random());

            colors.push(color.r, color.g, color.b);
            colors.push(color.r, color.g, color.b);
            colors.push(color.r, color.g, color.b);

            colors.push(color.r, color.g, color.b);
            colors.push(color.r, color.g, color.b);
            colors.push(color.r, color.g, color.b);
        }

        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        // geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        const material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, color: "green"});
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

    }

    function cubeColor() {
        const geometry = new THREE.BufferGeometry();
        const indices = [];

        const size = 20;
        const segments = 10;

        const halfSize = size / 2;
        const segmentSize = size / segments;
        const _color = new THREE.Color();

        const vertices = [];
        const normals = [];
        const colors = [];

        for (let i = 0; i <= segments; i++) {
            const y = (i * segmentSize) - halfSize;
            for (let j = 0; j <= segments; j++) {
                const x = (j * segmentSize) - halfSize;

                vertices.push(x + Math.random(), -y + Math.random(), Math.random());
                normals.push(0, 0, 1);

                const red = (x / size) + 0.5;
                const green = (y / size) + 0.5;
                _color.setRGB(red, green, 1, THREE.SRGBColorSpace);
                colors.push(_color.r, _color.g, _color.b);

            }
        }
        // generate indices (data for element array buffer)
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {

                const a = i * (segments + 1) + (j + 1);
                const b = i * (segments + 1) + j;
                const c = (i + 1) * (segments + 1) + j;
                const d = (i + 1) * (segments + 1) + (j + 1);

                // generate two faces (triangles) per iteration
                indices.push(a, b, d); // face one
                indices.push(b, c, d); // face two

            }
        }


        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            vertexColors: true
        });

        let mesh = new THREE.Mesh(geometry, material);
        const helper = new VertexNormalsHelper(mesh, 1, 0xff0000);

        scene.add(mesh);
        scene.add(helper);

    }

    /**
     * https://threejs.org/examples/?q=buffer#webgl_interactive_buffergeometry
     */
    function bufferGeometryDemo() {
        const triangles = 5;
        let geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(triangles * 3 * 3);
        const normals = new Float32Array(triangles * 3 * 3);
        const colors = new Float32Array(triangles * 3 * 3);

        const _color = new THREE.Color();

        const n = 9, n2 = n / 2;	// triangles spread in the cube
        const d = 10, d2 = d / 2;	// individual triangle size

        // Normals Vectors
        const pA = new THREE.Vector3();
        const pB = new THREE.Vector3();
        const pC = new THREE.Vector3();

        const cb = new THREE.Vector3();
        const ab = new THREE.Vector3();

        for (let i = 0; i < positions.length; i += 9) {
            const x = Math.random() * n - n2;
            const y = Math.random() * n - n2;
            const z = Math.random() * n - n2;

            const ax = x + Math.random() * d - d2;
            const ay = y + Math.random() * d - d2;
            const az = z + Math.random() * d - d2;

            const bx = x + Math.random() * d - d2;
            const by = y + Math.random() * d - d2;
            const bz = z + Math.random() * d - d2;

            const cx = x + Math.random() * d - d2;
            const cy = y + Math.random() * d - d2;
            const cz = z + Math.random() * d - d2;

            positions[i] = ax;
            positions[i + 1] = ay;
            positions[i + 2] = az;

            positions[i + 3] = bx;
            positions[i + 4] = by;
            positions[i + 5] = bz;

            positions[i + 6] = cx;
            positions[i + 7] = cy;
            positions[i + 8] = cz;

            // flat face normals
            pA.set(ax, ay, az);
            pB.set(bx, by, bz);
            pC.set(cx, cy, cz);

            cb.subVectors(pC, pB);
            ab.subVectors(pA, pB);
            cb.cross(ab);

            cb.normalize();

            const nx = cb.x;
            const ny = cb.y;
            const nz = cb.z;

            normals[i] = nx;
            normals[i + 1] = ny;
            normals[i + 2] = nz;

            normals[i + 3] = nx;
            normals[i + 4] = ny;
            normals[i + 5] = nz;

            normals[i + 6] = nx;
            normals[i + 7] = ny;
            normals[i + 8] = nz;

            // colors
            const vx = (x / n) + 0.5;
            const vy = (y / n) + 0.5;
            const vz = (z / n) + 0.5;

            _color.setRGB(vx, vy, vz);
            colors[i] = _color.r;
            colors[i + 1] = _color.g;
            colors[i + 2] = _color.b;

            colors[i + 3] = _color.r;
            colors[i + 4] = _color.g;
            colors[i + 5] = _color.b;

            colors[i + 6] = _color.r;
            colors[i + 7] = _color.g;
            colors[i + 8] = _color.b;
        }


        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.computeBoundingSphere();

        let material = new THREE.MeshPhongMaterial({
            color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
            side: THREE.DoubleSide, vertexColors: true
        });

        let mesh = new THREE.Mesh(geometry, material);
        const helper = new VertexNormalsHelper(mesh, 1, 0xff0000);

        scene.add(mesh);
        scene.add(helper);
    }

    function simpleTriangle() {
        let geometry = new THREE.BufferGeometry();
        const vertices = 3;  // Triangle ;)

        const positions = new Float32Array(vertices * 3);
        const normals = new Float32Array(vertices * 3);
        const colors = new Float32Array(vertices * 3);

        // Normals Vectors
        const pA = new THREE.Vector3();
        const pB = new THREE.Vector3();
        const pC = new THREE.Vector3();

        const cb = new THREE.Vector3();
        const ab = new THREE.Vector3();

        // Points
        const ax = -10;
        const ay = -2;
        const az = 0;

        const bx = 2;
        const by = 10;
        const bz = 0;

        const cx = 10;
        const cy = -2;
        const cz = 0;

        positions[0] = ax;
        positions[1] = ay;
        positions[2] = az;

        positions[3] = bx;
        positions[4] = by;
        positions[5] = bz;

        positions[6] = cx;
        positions[7] = cy;
        positions[8] = cz;

        // flat face normals
        pA.set(ax, ay, az);
        pB.set(bx, by, bz);
        pC.set(cx, cy, cz);

        cb.subVectors(pC, pB);
        ab.subVectors(pA, pB);
        cb.cross(ab);

        cb.normalize();

        const nx = cb.x;
        const ny = cb.y;
        const nz = cb.z;

        normals[0] = nx;
        normals[1] = ny;
        normals[2] = nz;

        normals[3] = nx;
        normals[4] = ny;
        normals[5] = nz;

        normals[6] = nx;
        normals[7] = ny;
        normals[8] = nz;

        // colors
        _color.setRGB(3, 252, 173);
        for (let i = 0; i < positions.length; i += 3) {
            colors[i] = _color.r;
            colors[i + 1] = _color.g;
            colors[i + 2] = _color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.computeBoundingSphere();

        let material = new THREE.MeshPhongMaterial({
            color: 0xaaaaaa, specular: 0xffffff, shininess: 250,
            side: THREE.DoubleSide, vertexColors: true
        });

        let mesh = new THREE.Mesh(geometry, material);
        const helper = new VertexNormalsHelper(mesh, 1, 0xff0000);

        scene.add(mesh);
        scene.add(helper);

    }

    function pointShape() {
        const pointCount = 10000;
        const spread = 1000;

        const vertices = [];
        for (let i = 0; i < pointCount; i++) {
            const x = THREE.MathUtils.randFloatSpread(spread);
            const y = THREE.MathUtils.randFloatSpread(spread);
            const z = THREE.MathUtils.randFloatSpread(spread);
            vertices.push( x, y, z );
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({color: 0x888888});

        const mesh = new THREE.Points(geometry, material);
        scene.add(mesh);
    }


    // geometrySimple();
    // geometryIndex();
    // geometrySimpleModified();
    // cube();
    // cubeColor();
    // bufferGeometryDemo();
    // simpleTriangle();
    // pointShape();


    setGameLoop((delta) => {

    });

    animate(0);

}