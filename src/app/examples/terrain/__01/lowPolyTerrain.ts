/*
@credits:
https://medium.com/@joshmarinacci/low-poly-style-terrain-generation-8a017ab02e7b
https://www.redblobgames.com/maps/terrain-from-noise/
https://vr.josh.earth/webxr-experiments/geometry/terrain2.html

*/
// @ts-nocheck
import * as THREE from "three";
// import SimplexNoise from 'simplex-noise';
import { createNoise2D } from 'simplex-noise';
import {POINTER_CLICK, POINTER_ENTER, POINTER_EXIT, Pointer} from './pointer.js'
import { WEBVR } from "./webvr.js";


export default function demo() {
    const COLORS = {
        GRASS:0x228800,
        WATER:0x44ccff
    }
    
    //JQuery-like selector
    const $ = (sel) => document.querySelector(sel)
    const on = (elem, type, cb) => elem.addEventListener(type,cb)
    
    // global constants and variables for your app go here
    let camera, scene, renderer, pointer, stats;
    
    let obj
    
    
    // let simplex = new SimplexNoise(4);
    
    const noise2D = createNoise2D(Alea('seed'));

    function map(val, smin, smax, emin, emax) {
        const t =  (val-smin)/(smax-smin)
        return (emax-emin)*t + emin
    }
    function noise(nx, ny) {
        // Rescale from -1.0:+1.0 to 0.0:1.0
        // return simplex.noise2D(nx, ny) / 2 + 0.5;
        return noise2D(nx, ny) / 2 + 0.5;
    }
    function octave(nx,ny,octaves) {
        let val = 0;
        let freq = 1;
        let max = 0;
        let amp = 1;
        for(let i=0; i<octaves; i++) {
            val += noise(nx*freq,ny*freq)*amp;
            max += amp;
            amp /= 2;
            freq  *= 2;
        }
        return val/max;
    }
    
    //generate grayscale image of noise
    function generateTexture() {
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        // const canvas = document.getElementById('debug-canvas')
        const c = canvas.getContext('2d')
        c.fillStyle = 'black'
        c.fillRect(0,0,canvas.width, canvas.height)
    
        for(let i=0; i<canvas.width; i++) {
            for(let j=0; j<canvas.height; j++) {
                let v =  octave(i/canvas.width,j/canvas.height,16)
                const per = (100*v).toFixed(2)+'%'
                c.fillStyle = `rgb(${per},${per},${per})`
                c.fillRect(i,j,1,1)
            }
        }
        return c.getImageData(0,0,canvas.width,canvas.height)
    }
    
    function generateMeshFromTexture(data) {
        //make plane geometry
        const geo = new THREE.PlaneGeometry(data.width,data.height,data.width,data.height+1)
        const vertices = geo.attributes.position.array

        for(let j=0; j<data.height; j++) {
            for (let i = 0; i < data.width; i++) {
                const n = (j*(data.width)+i)
                const nn = (j*(data.width+1)+i)
                const col = data.data[n*4]
                const v1 = geo.vertices[nn]
                v1.z = map(col,0,255,-10,10)
                if(v1.z > 2.5) v1.z *= 1.3
                //jitter x and y
                // v1.x += map(Math.random(),0,1,-0.5,0.5)
                // v1.y += map(Math.random(),0,1,-0.5,0.5)
            }
        }
        geo.faces.forEach(f=>{
            const a = geo.vertices[f.a]
            const b = geo.vertices[f.b]
            const c = geo.vertices[f.c]
            const avg = (a.z+b.z+c.z)/3
            const max = Math.max(a.z,Math.max(b.z,c.z))
    
            //if average is below water, set to 0
            if(avg < 0) {
                a.z = 0
                b.z = 0
                c.z = 0
            }
            //assign colors based on the highest point of the face
            if(max <=0)   return f.color.set(COLORS.WATER)
            if(max <=1.5) return f.color.set(COLORS.GRASS)
            if(max <=3.5)   return f.color.set(0xeecc44)
            if(max <=5)   return f.color.set(0xcccccc)
            f.color.set('white')
        })
        geo.colorsNeedUpdate = true
        geo.verticesNeedUpdate = true
        geo.computeFlatVertexNormals()
        const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
            // color:'white',
            // wireframe:true,
            vertexColors: THREE.VertexColors,
            flatShading:true,
        }))
        // mesh.position.y = -0
        // mesh.position.z = -20
        // mesh.rotation.x = -30 * Math.PI/180
        return mesh
    }
    
    function jitter(geo,per) {
        geo.vertices.forEach(v => {
            v.x += map(Math.random(),0,1,-per,per)
            v.y += map(Math.random(),0,1,-per,per)
            v.z += map(Math.random(),0,1,-per,per)
        })
    }
    function chopBottom(geo,bottom) {
        geo.vertices.forEach(v => {
            if(v.y < bottom) v.y = bottom
        })
    }
    
    const toRad = deg => deg * Math.PI/180
    
    function makeTree(scale) {
        const tree = new THREE.Geometry()
        function randomColor(geo,color,per) {
            geo.faces.forEach(f => {
                f.color.set(color)
            })
        }
        const levels = Math.floor(map(Math.random(),0,1,2,5))
        for(let i=0; i<levels; i++) {
            const cone2 = new THREE.ConeGeometry(1+3-i, levels, 8)
            cone2.translate(0, i*2, 0)
            randomColor(cone2,0x00ff00,0.2)
            tree.merge(cone2)
        }
    
        const trunk = new THREE.CylinderGeometry(0.5,0.5,2)
        trunk.translate(0,-2,0)
        randomColor(trunk,0xbb6600)
        tree.merge(trunk)
        tree.translate(0,2,0)
        jitter(tree,0.05)
        tree.scale(scale,scale,scale)
        tree.colorsNeedUpdate = true
        tree.verticesNeedUpdate = true
        tree.computeFlatVertexNormals()
        const mesh = new THREE.Mesh(tree, new THREE.MeshLambertMaterial({
            // color:'white',
            // wireframe:true,
            vertexColors: THREE.VertexColors,
            flatShading:true,
        }))
        return mesh
    }
    
    function makeCloud() {
        const geo = new THREE.SphereGeometry(2, 16, 8)
        geo.scale(1.5,1,1)
    
        const size2 = map(Math.random(),0,1, 0.5,1.5)
        const geo2 = new THREE.SphereGeometry(size2,7,5)
        // const angle = map(Math.random(),0,1,30,90)
        geo2.rotateX(toRad(90))
        geo2.scale(2,2,1)
        geo2.translate(2,0.5,0)
        geo.merge(geo2)
    
        const size3 = map(Math.random(),0,1, 0.5,1.5)
        const geo3 = new THREE.SphereGeometry(size3,5,7)
        geo3.rotateZ(toRad(90))
        geo3.scale(1.5,1.5,1)
        geo3.translate(-2,0.5,0)
        geo.merge(geo3)
    
    
        jitter(geo,0.1)
        chopBottom(geo,-0.0)
        geo.colorsNeedUpdate = true
        geo.verticesNeedUpdate = true
        geo.computeFlatVertexNormals()
        const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
            // color:'white',
            // wireframe:true,
            // vertexColors: THREE.VertexColors,
            flatShading:true,
        }))
        // mesh.position.z = -8
        // mesh.position.y = 1.5
        return mesh
    }
    
    
    
    //called on setup. Customize this
    function initContent(scene,camera,renderer) {
        //set the background color of the scene
        scene.background = new THREE.Color( 0xcccccc );
    
        const light = new THREE.DirectionalLight( 0xffffff, 0.7 );
        light.position.set( 1, 1, 0 ).normalize();
        scene.add( light );
    
        const light2 = new THREE.DirectionalLight( 0xff5566, 0.4 );
        light2.position.set( -3, -1, 0 ).normalize();
        scene.add( light2 );
    
        scene.add(new THREE.AmbientLight(0xffffff,0.3))
    
    
        // $("#overlay").style.display = 'none'
        // if($('#enter-vr'))  $('#enter-vr').removeAttribute('disabled')
    
    
    
        const group = new THREE.Group()
        group.position.z = -10
        group.position.y = 0
        scene.add(group)
        obj = group
    
        //add the terrain
        const tex = generateTexture()
        const terrain = generateMeshFromTexture(tex)
        terrain.rotation.x = toRad(-90)
        group.add(terrain)
        group.rotation.y = toRad(-45)
        group.rotation.x = toRad(0)
    
        //find a vertex where z is exactly 0
        let n = -1;
        let treeCount = 0
        while(true) {
            // if(treeCount > 300) break
            n++
            if(n>=terrain.geometry.faces.length) break
            const f = terrain.geometry.faces[n]
            const v = terrain.geometry.vertices[f.a]
            if(f.color.getHex() === COLORS.GRASS && v.z > 0) {
                const tree = makeTree(0.1)
                tree.position.set(v.x,v.z,-v.y)
                group.add(tree)
                // console.log(v.z)
                treeCount++
            }
        }
    
    
        for(let i=0; i<5; i++) {
            const cloud = makeCloud()
            cloud.position.set(
                map(Math.random(),0,1,-10,10),
                8,
                map(Math.random(),0,1,-10,10),
            )
            group.add(cloud)
        }
    
    
    }
    
    //called on every frame. customize this
    function render(time) {
        //update the pointer and stats, if configured
        if(pointer) pointer.tick(time)
        if(stats) stats.update(time)
        //rotate the cube on every tick
        // if(obj) obj.rotation.y -= 0.001
        renderer.render( scene, camera );
    }
    
    
    // you shouldn't need to modify much below here
    
    function initScene() {
        //create DIV for the canvas
        const container = document.createElement( 'div' );
        document.body.appendChild( container );
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 250 );
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.gammaOutput = true
        // renderer.vr.enabled = true;
        container.appendChild( renderer.domElement );
        document.body.appendChild( WEBVR.createButton( renderer ) );
    
        initContent(scene,camera,renderer)
    
        window.addEventListener( 'resize', ()=>{
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );
        }, false );
    
        THREE.DefaultLoadingManager.onStart = (url, loaded, total) => {
            console.log(`loading ${url}.  loaded ${loaded} of ${total}`)
        }
        THREE.DefaultLoadingManager.onLoad = () => {
            console.log(`loading complete`)
            console.log("really setting it up now")
            $('#loading-indicator').style.display = 'none'
            $('#click-to-play').style.display = 'block'
            const overlay = $('#overlay')
            $("#click-to-play").addEventListener('click',()=>{
                overlay.style.visibility = 'hidden'
                if($('#enter-vr'))  $('#enter-vr').removeAttribute('disabled')
            })
        }
        THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => {
            console.log(`prog ${url}.  loaded ${loaded} of ${total}`)
            $("#progress").setAttribute('value',100*(loaded/total))
        }
        THREE.DefaultLoadingManager.onError = (url) => {
            console.log(`error loading ${url}`)
        }
    
    
    }
    
    
    
    // initPage()
    initScene()
    renderer.setAnimationLoop(render)
};
