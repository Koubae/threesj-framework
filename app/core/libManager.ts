import * as THREE from 'three';
import GroundFlat from "../components/world/GroundFlat.js";

export default class LibManager {
    /** @type {import * as THREE from "three";} */
    static THREE: any = THREE;
    static components: { [key : string]: any} = {
        GroundFlat: GroundFlat,
    };

    constructor() {
        throw new Error("LibManager is not instantiable!");
    }

}