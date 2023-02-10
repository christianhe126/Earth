import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import { OBJLoader } from '/jsm/loaders/OBJLoader.js'
import Stats from '/jsm/libs/stats.module.js';

// global variables
let scene;
let camera;
let renderer;
const canvas = document.querySelector('.webgl');
let satRotation = false;
let satStartRotation = -Math.PI / 2.3;

//Legend setup
document.getElementById("run").addEventListener("click", runPressed)

// scene setup
scene = new THREE.Scene();

// camera setup
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;

camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;
scene.add(camera);

// renderer setup
renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
renderer.autoClear = false;
renderer.setClearColor(0x000000, 0.0);

// orbit control setup
const controls = new OrbitControls(camera, renderer.domElement);

// earth geometry
const earthGeometry = new THREE.SphereGeometry(0.6, 32, 32);

// earth material
const earthMaterial = new THREE.MeshBasicMaterial({
    //roughness: 1,
    //metalness: 0,
    map: THREE.ImageUtils.loadTexture('texture/earthmap1k.jpg'),
    //bumpMap: THREE.ImageUtils.loadTexture('texture/earthbump.jpg'),
    //bumpScale: 0.3
});

// earth mesh
const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
//earthMesh.rotation.x = Math.PI / 4
scene.add(earthMesh);

// cloud Geometry
const cloudGeometry = new THREE.SphereGeometry(0.63, 32, 32);

// cloud metarial
const cloudMetarial = new THREE.MeshPhongMaterial({
    map: THREE.ImageUtils.loadTexture('texture/earthCloud.png'),
    transparent: true,
});

// cloud mesh
const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMetarial);
scene.add(cloudMesh);

// galaxy geometry
const starGeometry = new THREE.SphereGeometry(80, 64, 64);

// galaxy material
const starMaterial = new THREE.MeshBasicMaterial({
    map: THREE.ImageUtils.loadTexture('texture/galaxy.png'),
    side: THREE.BackSide
});

// galaxy mesh
const starMesh = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starMesh);

// ambient light
const ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientlight);

// point light
const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.set(5, 3, 5);
scene.add(pointLight);

// point light helper
const Helper = new THREE.PointLightHelper(pointLight);
scene.add(Helper);

// handling resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}, false);

// current fps
const stats = Stats();
document.body.appendChild(stats.dom);

// spinning animation
const animate = () => {
    requestAnimationFrame(animate);
    starMesh.rotation.y -= 0.002 * 0.1;
    earthMesh.rotation.y -= 0.0015 * 0.5;
    cloudMesh.rotation.y -= 0.001 * 0.5;
    controls.update();
    render();
    stats.update();
};

//Load coordinates
var points = []
await loadJson().then(coordinates => {
    for(let i = 0; i < coordinates.length; i++)
    {
        var box1 =  new THREE.Mesh(
            new THREE.SphereGeometry(0.01, 32),
            new THREE.MeshBasicMaterial({color: 0xffffff} )
        );
        box1.rotation.y = Math.PI / 2
        box1 = positionToSphere(earthMesh, box1, coordinates[i].lat, coordinates[i].lon, -0.01)
        points.push(
            {geo: box1,
            lat: coordinates[i].lat,
            lon: coordinates[i].lon}
        )
        earthMesh.add(points[i].geo)
    }
})

//satellite
var satReferencePoint = new THREE.Mesh(new THREE.SphereGeometry(0.0001, 32, 32), new THREE.MeshBasicMaterial())
satReferencePoint.position.x = 0;
satReferencePoint.position.y = 0;
satReferencePoint.position.z = 0;
satReferencePoint.rotation.y = satStartRotation
scene.add(satReferencePoint)

var sat;
const loader = new OBJLoader();
    loader.load(
        // resource URL
        'texture/sat.obj',
        // called when resource is loaded
        function ( object ) {
            sat = object
            sat.scale.set(0.01,0.01,0.01)
            //sat.rotation.z = 1.2
            sat = positionToSphere(satReferencePoint, sat, (90-0)*(Math.PI/180) , (0+180)*(Math.PI/180), 1.2)
            satReferencePoint.add(sat);
            
    
        },
        // called when loading is in progresses
        function ( xhr ) {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        }
    );
//keycontrol
window.addEventListener( 'keydown', function ( event ) {

    switch ( event.key ) {

        case "ArrowLeft": // Q
            earthMesh.rotation.y -= 0.1
            //control.setSpace( control.space === 'local' ? 'world' : 'local' );
            break;

        case "ArrowRight": // W
            earthMesh.rotation.y += 0.1
            break;
        
        case "ArrowDown": // W
            earthMesh.rotation.x -= 0.1
        break;

        case "ArrowUp": // W
            earthMesh.rotation.x += 0.1
        break;
    }

} );

var count = 0
// rendering
const render = () => {
    count++;
    //Satellite
    sat.rotation.x += 0.003
    if(satRotation == true && satReferencePoint.rotation.y >= -Math.PI * 2 + satStartRotation)
    {
        if(count % 20 == 0)
        {
        if(count % 3 == 0)
            document.getElementById("output").innerText = "Calculating sphere..."
        else if(count % 3 == 1)
            document.getElementById("output").innerText = "Calculating sphere.."
        else if(count % 3 == 2)
            document.getElementById("output").innerText = "Calculating sphere."
        }

        satReferencePoint.rotation.y -= 0.01
        starMesh.rotation.y -= 0.01;

        for(let i = 0; i < points.length; i++)
        {
            if(i < (satReferencePoint.rotation.y / (-Math.PI * 2 + satStartRotation)) * points.length && i % 1 == 0)
                points[i].geo.material.color.setHex(0x990276)
            //console.log(satReferencePoint.rotation.y / (-Math.PI * 2 + satStartRotation))
        }
        console.log(satReferencePoint.rotation.y / (-Math.PI * 2 + satStartRotation))
    }
    else if(satRotation == true)
    {
        satReferencePoint.rotation.y = satStartRotation
        satRotation = false
        document.getElementById("output").innerText = "Finished \n \n we took 50 photos out of 100 with a total value of 300k$"
    }
    renderer.render(scene, camera);
}

animate();

function positionToSphere(sphereMesh, mesh, lat, long, alt) {
    // defaults for lat, long, and alt
    lat = lat === undefined ? 0 : lat;
    long = long === undefined ? 0 : long;
    alt = alt === undefined ? 0 : alt;

    // get geometry of the sphere mesh
    var sGeo = sphereMesh.geometry;
    sGeo.computeBoundingSphere();
    var radius = sGeo.boundingSphere.radius + alt;

    //calculate position
    var phi = (90-lat)*(Math.PI/180),
    theta = (long+180)*(Math.PI/180)

    phi = lat
    theta = long

    var x = -((radius) * Math.sin(phi)*Math.cos(theta)),
    z = ((radius) * Math.sin(phi)*Math.sin(theta)),
    y = ((radius) * Math.cos(phi));
    mesh.position.x = x
    mesh.position.y = y
    mesh.position.z = z

    return mesh;
};

async function loadJson() {
    //Load JSON
    var _data;
    await fetch('/data/coordinates.json').then(response => response.json()).then(data => _data = data.values)
    return _data
}

function runPressed() {
    satRotation = true;
}