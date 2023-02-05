import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';
import { OBJLoader } from '/jsm/loaders/OBJLoader.js'
import Stats from '/jsm/libs/stats.module.js';

// global variables
let scene;
let camera;
let renderer;
const canvas = document.querySelector('.webgl');

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
    starMesh.rotation.y -= 0.002 * 2;
    earthMesh.rotation.y -= 0.0015 * 2;
    cloudMesh.rotation.y -= 0.001 * 2;
    controls.update();
    render();
    stats.update();
};

//pointsv2
var picGeo = new THREE.PlaneGeometry( 200, 200 );
var pointImg = THREE.ImageUtils.loadTexture('texture/point.jpg');
var pic = new THREE.Mesh(picGeo, new THREE.MeshBasicMaterial({color:0xffdd99, pointImg, transparent:true, opacity:0.8, wireframe:false}));

var box1 =  new THREE.Mesh(
    new THREE.CircleGeometry(0.02, 32),
    new THREE.MeshBasicMaterial({color: 0x00ff00} )
);
box1.rotation.y = Math.PI / 2
box1 = positionToSphere(earthMesh, box1, 18.84055555555, 8.759722222, 0)
earthMesh.add(box1)

//satellite
const loader = new OBJLoader();
// load a resource
var sat;
loader.load(
	// resource URL
	'texture/sat.obj',
	// called when resource is loaded
	function ( object ) {
        sat = object
        sat.scale.set(0.01,0.01,0.01)
        sat = positionToSphere(earthMesh, sat, 18.84055555555, 8.759722222, 0.5)
        earthMesh.add(sat)
		

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


// rendering
const render = () => {
    console.log(box1.rotation.y)
    sat.rotation.z += 0.01
    //box1.lookAt()
    //box1.quaternion.copy(camera.quaternion)
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
    // computer bounding sphere for geometry of the sphere mesh
    sGeo.computeBoundingSphere();
    // use radius value of Sphere instance at 
    // boundingSphere of the geometry of sphereMesh
    var radius = sGeo.boundingSphere.radius;
    // position mesh to position of sphereMesh, and translate
    // from there using lat, long, alt, and radius of sphereMesh
    // using the copy, add, and apply Euler methods of the Vector3 class
    var v1 = new THREE.Vector3(0, radius + alt, 0);
    var x = Math.PI * lat;
    var z = Math.PI * 2 * long;
    var e1 = new THREE.Euler(x, 0, z)
    mesh.position.copy(sphereMesh.position).add(v1).applyEuler(e1);
    return mesh;
};