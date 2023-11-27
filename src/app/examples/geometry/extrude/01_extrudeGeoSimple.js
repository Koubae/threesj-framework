import * as THREE from 'three';

import {VertexNormalsHelper} from 'three/addons/helpers/VertexNormalsHelper.js';

import game from "../../../minimal";

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

    /**
     * https://threejs.org/docs/#api/en/geometries/ExtrudeGeometry
     */
    function _01_fromTutorial() {
        const startPoint = 5;
        const length = startPoint + 12, width = startPoint + 8;

        const shape = new THREE.Shape();
        shape.moveTo(startPoint, startPoint);
        shape.lineTo(startPoint, width);
        shape.lineTo(length, width);
        shape.lineTo(length, startPoint);
        shape.lineTo(startPoint, startPoint);

        const extrudeSettings = {
            steps: 2,
            depth: 8,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 1
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshLambertMaterial({color: 0x00ff00});
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
    }

    /**
     * https://stackoverflow.com/questions/71658439/three-js-extrude-vertically
     */
    function _02_fromStackOverflowExtrudeYAxis() {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, 200 / 100);
        shape.lineTo(400 / 100, 200 / 100);
        shape.lineTo(400 / 100, 0);
        shape.lineTo(0, 0);

        const extrudeSettings = {
            steps: 2,
            depth: 10,
            bevelEnabled: false,
            bevelThickness: 1,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 1,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.rotateX(THREE.MathUtils.degToRad(-90));
        geometry.translate(0, 0, 200 / 100);

        const material = new THREE.MeshLambertMaterial({
            color: 'blue',
            opacity: 0.7,
            transparent: false,
        });

        const location = new THREE.Mesh(geometry, material);
        const axesHelper = new THREE.AxesHelper(5);
        location.add(axesHelper);
        // location.position.set(
        //     storageLocation.startPoint.x / 100,
        //     storageLocation.startPoint.y / 100,
        //     storageLocation.startPoint.z / 100
        // );

        location.updateMatrix();
        scene.add(location);

    }

    function _03_fromArticle_MoreAdvancedTechniques__01() {
        // ---------- ----------
        // VECTOR2 POINTS / SHAPE
        // ---------- ----------
        const v2array = [
            new THREE.Vector2(0.0, -0.8),
            new THREE.Vector2(0.5, 0.0),
            new THREE.Vector2(0.0, 0.8),
            new THREE.Vector2(-1.5, 0.0)
        ];
        const shape = new THREE.Shape(v2array);
        // ---------- ----------
        // GEOMETRY
        // ---------- ----------
        const geometry = new THREE.ExtrudeGeometry(shape);
        // ---------- ----------
        // OBJECTS
        // ---------- ----------
        scene.add(new THREE.GridHelper(10, 10));
        const mesh1 = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
        scene.add(mesh1)
    }

    function _03_fromArticle_MoreAdvancedTechniques__02() {
        // ---------- ----------
        // SHAPE / PATH
        // ---------- ----------
        const shape = new THREE.Shape();
        shape.moveTo(0, -1);
        shape.bezierCurveTo(0.25, -0.25, 0.25, 0, 1, 0);
        shape.lineTo(1, 1);
        shape.lineTo(-1, 1);
        shape.bezierCurveTo(-2, 0, -2, -1, 0, -1);
        // ---------- ----------
        // GEOMETRY
        // ---------- ----------
        const geometry = new THREE.ExtrudeGeometry(shape);
        // ---------- ----------
        // OBJECTS
        // ---------- ----------
        scene.add(new THREE.GridHelper(10, 10));
        const mesh1 = new THREE.Mesh(geometry, new THREE.MeshNormalMaterial());
        scene.add(mesh1)
    }

    function _03_fromArticle_MoreAdvancedTechniques__03() {
        // ---------- ----------
        // SCENE, CAMERA, RENDERER
        // ---------- ----------
        // const scene = new THREE.Scene();
        // const camera = new THREE.PerspectiveCamera(50, 32 / 24, 0.1, 1000);
        // const renderer = new THREE.WebGL1Renderer();
        // scene.background = null;
        // renderer.setClearColor(0x000000, 0)
        // renderer.setSize(640, 480, false);
        const canvas_2d = document.createElement('canvas');
        canvas_2d.style = 'block';
        const ctx = canvas_2d.getContext('2d');
        canvas_2d.width = 640;
        canvas_2d.height = 480;
        const container = document.body;
        container.appendChild(canvas_2d);
        // ---------- ----------
        // HELPER FUNCTIONS
        // ---------- ----------
        const createMiniMap = (pos = new THREE.Vector2(), size = 256, geometry = null) => {
            const minimap = {
                pos: pos,
                size: size,
                v2array: []
            };
            if (geometry) {
                setV2array(minimap, geometry);
            }
            return minimap;
        };
        // create the v2 array for the minimap based on the given geometry
        const setV2array = (minimap, geometry) => {
            const att_uv = geometry.getAttribute('uv');
            const v2array = [];
            let i = 0;
            const len = att_uv.count;
            while (i < len) {
                v2array.push(new THREE.Vector2(att_uv.getX(i), 1 - att_uv.getY(i)));
                i += 1;
            }
            minimap.v2array = v2array;
        };
        // get a vector2 from the v2 array that is scaled based on size
        const getMiniMapV2 = (minimap, i) => {
            return minimap.v2array[i].clone().multiplyScalar(minimap.size);
        };
        // draw the minimap
        const drawMinimap = (minimap, ctx) => {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.translate(minimap.pos.x, minimap.pos.y);
            ctx.drawImage(canvas_texture, 0, 0, minimap.size, minimap.size);
            let i = 0;
            const len = minimap.v2array.length;
            ctx.strokeStyle = 'black';
            //ctx.fillStyle = 'rgba(0,255,255, 0.025)';
            ctx.lineWidth = 2;
            while (i < len) {
                const v1 = getMiniMapV2(minimap, i);
                const v2 = getMiniMapV2(minimap, i + 1);
                const v3 = getMiniMapV2(minimap, i + 2);
                ctx.beginPath();
                ctx.moveTo(v1.x, v1.y);
                ctx.lineTo(v2.x, v2.y);
                ctx.lineTo(v3.x, v3.y);
                ctx.closePath();
                ctx.stroke();
                //ctx.fill();
                i += 3;
            }
            ctx.restore();
        };
        // ---------- ----------
        // TEXTURE
        // ---------- ----------
        const canvas_texture = document.createElement('canvas');
        const ctx_texture = canvas_texture.getContext('2d');
        canvas_texture.height = canvas_texture.width = 32;
        const gradient = ctx_texture.createLinearGradient(0, 32, 32, 0);
        gradient.addColorStop(0.00, 'red');
        gradient.addColorStop(0.40, 'yellow');
        gradient.addColorStop(0.50, 'lime');
        gradient.addColorStop(0.60, 'cyan');
        gradient.addColorStop(1.00, 'blue');
        ctx_texture.fillStyle = gradient;
        ctx_texture.fillRect(0, 0, 32, 32);
        const texture = new THREE.CanvasTexture(canvas_texture);
        // ---------- ----------
        // CUSTOM UV GENERATOR
        // ---------- ----------
        const UVGenerator = {
            generateTopUV: function (geometry, vertices, indexA, indexB, indexC) {
                return [
                    new THREE.Vector2(0.05, 0.45),
                    new THREE.Vector2(0.05, 0.95),
                    new THREE.Vector2(0.95, 0.45),
                ];
            },
            generateSideWallUV: function (geometry, vertices, indexA, indexB, indexC, indexD) {
                return [
                    new THREE.Vector2(0.05, 0.05),
                    new THREE.Vector2(0.20, 0.05),
                    new THREE.Vector2(0.20, 0.20),
                    new THREE.Vector2(0.05, 0.05)
                ];
            }
        };
        // ---------- ----------
        // SHAPE/GEOMETRY
        // ---------- ----------
        const shape = new THREE.Shape();
        shape.moveTo(0.00, -0.80);
        shape.lineTo(0.75, 0.00);
        shape.lineTo(0.00, 1.20);
        shape.lineTo(-0.75, 0.00);
        const geometry = new THREE.ExtrudeGeometry(shape, {
            UVGenerator: UVGenerator,
            depth: 0.3,
            bevelEnabled: false
        });
        // ---------- ----------
        // OBJECTS
        // ---------- ----------
        // grid
        const grid = new THREE.GridHelper(10, 10);
        grid.material.linewidth = 3;
        scene.add(grid);
        // mesh1
        const material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: texture});
        const mesh1 = new THREE.Mesh(geometry, material);
        scene.add(mesh1);
        // ---------- ----------
        // RENDER
        // ---------- ----------
        const minimap = createMiniMap(new THREE.Vector2(430, 10), 200, geometry);
        camera.position.set(2, 1, 2);
        camera.lookAt(0.4, 0.1, 0);
        setV2array(minimap, geometry);
        renderer.render(scene, camera);
        // background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, canvas_2d.width, canvas_2d.height);
        // draw dom element
        ctx.drawImage(renderer.domElement, 0, 0, canvas_2d.width, canvas_2d.height);
        // draw uv minimap
        drawMinimap(minimap, ctx);
        // text overlay
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, canvas_2d.width, canvas_2d.height);
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.font = '10px monospace';
    }

    function _03_fromArticle_MoreAdvancedTechniques__04() {
        const canvas_2d = document.createElement('canvas');
        canvas_2d.style = 'block';
        const ctx = canvas_2d.getContext('2d');
        canvas_2d.width = 640;
        canvas_2d.height = 480;
        const container = document.body;
        container.appendChild(canvas_2d);
        // ---------- ----------
        // HELPER FUNCTIONS
        // ---------- ----------
        // create a custom uv generator for the given shape
        const createUVGenerator = (shape) => {
            // x max and min values
            const shapeGeo = new THREE.ShapeGeometry(shape);
            shapeGeo.computeBoundingBox();
            const v3_max = shapeGeo.boundingBox.max;
            const v3_min = shapeGeo.boundingBox.min;
            // box2 class to get range vector2
            const box2_top = new THREE.Box2(new THREE.Vector2(v3_min.x, v3_min.y), new THREE.Vector2(v3_max.x, v3_max.y));
            const v_range = new THREE.Vector2();
            box2_top.getSize(v_range);
            // get axis helper
            const getAxisAlpha = (n, axis = 'x') => {
                const b = axis === 'x' ? v3_min.x : v3_min.y;
                const c = axis === 'x' ? v_range.x : v_range.y;
                return new THREE.Vector2(n, 0).distanceTo(new THREE.Vector2(b, 0)) / c;
            };
            // the generator object
            const UVGenerator = {
                generateTopUV: function (geometry, vertices, vert_indexA, vert_indexB, vert_indexC) {
                    const xa = getAxisAlpha(vertices[vert_indexA * 3], 'x');
                    const ya = getAxisAlpha(vertices[vert_indexA * 3 + 1], 'y');
                    const xb = getAxisAlpha(vertices[vert_indexB * 3], 'x');
                    const yb = getAxisAlpha(vertices[vert_indexB * 3 + 1], 'y');
                    const xc = getAxisAlpha(vertices[vert_indexC * 3], 'x');
                    const yc = getAxisAlpha(vertices[vert_indexC * 3 + 1], 'y');
                    return [
                        new THREE.Vector2(xa, ya),
                        new THREE.Vector2(xb, yb),
                        new THREE.Vector2(xc, yc),
                    ];
                },
                generateSideWallUV: function (geometry, vertices, indexA, indexB, indexC, indexD) {
                    return [
                        new THREE.Vector2(0, 0),
                        new THREE.Vector2(1, 0),
                        new THREE.Vector2(1, 1),
                        new THREE.Vector2(0, 0)
                    ];
                }
            };
            return UVGenerator;
        };
        // create the minimap object
        const createMiniMap = (pos = new THREE.Vector2(), size = 256, geometry = null) => {
            const minimap = {
                pos: pos,
                size: size,
                v2array: []
            };
            if (geometry) {
                setV2array(minimap, geometry);
            }
            return minimap;
        };
        // create the v2 array for the minimap based on the given geometry
        const setV2array = (minimap, geometry) => {
            const att_uv = geometry.getAttribute('uv');
            const v2array = [];
            let i = 0;
            const len = att_uv.count;
            while (i < len) {
                v2array.push(new THREE.Vector2(att_uv.getX(i), 1 - att_uv.getY(i)));
                i += 1;
            }
            minimap.v2array = v2array;
        };
        // get a vector2 from the v2 array that is scaled based on size
        const getMiniMapV2 = (minimap, i) => {
            return minimap.v2array[i].clone().multiplyScalar(minimap.size);
        };
        // draw the minimap
        const drawMinimap = (minimap, ctx) => {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.translate(minimap.pos.x, minimap.pos.y);
            ctx.drawImage(canvas_texture, 0, 0, minimap.size, minimap.size);
            let i = 0;
            const len = minimap.v2array.length;
            ctx.strokeStyle = 'black';
            //ctx.fillStyle = 'rgba(0,255,255, 0.025)';
            ctx.lineWidth = 2;
            while (i < len) {
                const v1 = getMiniMapV2(minimap, i);
                const v2 = getMiniMapV2(minimap, i + 1);
                const v3 = getMiniMapV2(minimap, i + 2);
                ctx.beginPath();
                ctx.moveTo(v1.x, v1.y);
                ctx.lineTo(v2.x, v2.y);
                ctx.lineTo(v3.x, v3.y);
                ctx.closePath();
                ctx.stroke();
                //ctx.fill();
                i += 3;
            }
            ctx.restore();
        };
        // ---------- ----------
        // TEXTURE
        // ---------- ----------
        const canvas_texture = document.createElement('canvas');
        const ctx_texture = canvas_texture.getContext('2d');
        canvas_texture.height = canvas_texture.width = 32;
        const gradient = ctx_texture.createLinearGradient(0, 32, 32, 0);
        gradient.addColorStop(0.00, 'red');
        gradient.addColorStop(0.40, 'yellow');
        gradient.addColorStop(0.50, 'lime');
        gradient.addColorStop(0.60, 'cyan');
        gradient.addColorStop(1.00, 'blue');
        ctx_texture.fillStyle = gradient;
        ctx_texture.fillRect(0, 0, 32, 32);
        const texture = new THREE.CanvasTexture(canvas_texture);
        // ---------- ----------
        // SHAPE/GEOMETRY
        // ---------- ----------
        const shape = new THREE.Shape();
        shape.moveTo(0.00, -0.80);
        shape.bezierCurveTo(0.3, 0, 0.2, 0.3, 0.75, -0.20);
        shape.bezierCurveTo(0.8, 0.5, 0.4, 0.5, 0.00, 1.20);
        shape.bezierCurveTo(-1, 0.5, -1, -0.5, 0.00, -0.80);
        const geometry = new THREE.ExtrudeGeometry(shape, {
            UVGenerator: createUVGenerator(shape),
            depth: 0.3,
            bevelEnabled: false
        });
        // ---------- ----------
        // OBJECTS
        // ---------- ----------
        // grid
        const grid = new THREE.GridHelper(10, 10);
        grid.material.linewidth = 3;
        scene.add(grid);
        // mesh1
        const material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: texture});
        const mesh1 = new THREE.Mesh(geometry, material);
        scene.add(mesh1);
        // ---------- ----------
        // RENDER
        // ---------- ----------
        const minimap = createMiniMap(new THREE.Vector2(430, 10), 200, geometry);
        camera.position.set(2, 1, 2);
        camera.lookAt(0.4, 0.1, 0);
        setV2array(minimap, geometry);
        renderer.render(scene, camera);
        // background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, canvas_2d.width, canvas_2d.height);
        // draw dom element
        ctx.drawImage(renderer.domElement, 0, 0, canvas_2d.width, canvas_2d.height);
        // draw uv minimap
        drawMinimap(minimap, ctx);
        // text overlay
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, canvas_2d.width, canvas_2d.height);
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.font = '10px monospace';
    }

    // _01_fromTutorial();
    // _02_fromStackOverflowExtrudeYAxis();
    // _03_fromArticle_MoreAdvancedTechniques__01();
    // _03_fromArticle_MoreAdvancedTechniques__02();
    // _03_fromArticle_MoreAdvancedTechniques__03();
    _03_fromArticle_MoreAdvancedTechniques__04();

    setGameLoop((delta) => {

    });

    animate(0);

}