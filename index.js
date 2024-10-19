import * as THREE from 'https://cdn.skypack.dev/three@0.134.0';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'https://cdn.skypack.dev/three@0.134.0/examples/jsm/shaders/RGBShiftShader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;

// Renderer setup
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Enable physically correct lighting
renderer.physicallyCorrectLights = true;

let model; // Declare the model variable globally

// Load HDRI environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/neuer_zollhof_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping; // Maps HDRI to be a spherical environment
    scene.environment = texture; // Set HDRI as environment lighting
});

// Load GLTF Model
const loader = new GLTFLoader();
loader.load('./assets/models/DamagedHelmet.gltf', (gltf) => {
    model = gltf.scene; // Assign the loaded model to the global variable
    scene.add(model); // Add the model to the scene
    console.log('Model loaded successfully');
}, undefined, (error) => {
    console.error('Error loading model:', error);
});

// Post-processing setup
const composer = new EffectComposer(renderer);

// RenderPass: Renders the scene normally
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// RGB Shift effect
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0030; // Adjust shift amount
composer.addPass(rgbShiftPass);

// Event listener for mouse movement
window.addEventListener("mousemove", (e) => {
    if (model) {
        const rotationX = (e.clientX / window.innerWidth - 0.5) * (Math.PI * 0.3);
        const rotationY = (e.clientY / window.innerHeight - 0.5) * (Math.PI * 0.3);
        gsap.to(model.rotation, {
            x: rotationY,
            y:rotationX,
            duration: 0.3,
            ease: "power2.out"
        });
    }
});

// Animation function
function animate() {
    requestAnimationFrame(animate);

    // Render the scene with post-processing effects
    composer.render();
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
