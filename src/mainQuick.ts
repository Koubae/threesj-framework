import './main.css';

import {
    // demoTerrain01,
    // demoTerrain02,
    // demoTerrain03,
    // demoTerrain04,
    // demoTerrain05,
    // demoTerrain06,
    // demoTerrain07,
    // demoTerrain08,
    TerrainEditor,
} from "./app/examples/terrain/demos.js";

// import {
//     geometryDemo01,
//     geometryDemo02,
//     geometryDemo03,
//     geometryExtrudeDemo01,
// } from "./app/examples/geometry/demos.ts";
//
// geometryExtrudeDemo01();

const terrainEditor = new TerrainEditor();
terrainEditor.run();