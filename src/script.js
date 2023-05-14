import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from './shader/fireflies/vertex.glsl'
import firefliesFragmentShader from './shader/fireflies/fragment.glsl'
import { BufferAttribute } from 'three'

/**
 * Spector
 */
// const SPECTOR = require('spectorjs')
// const spector = new SPECTOR.Spector()
// spector.displayUI()

/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('baked.jpg')


/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
bakedTexture.flipY = false

bakedTexture.encoding = THREE.sRGBEncoding

//pole light
const poleLightMaterial = new THREE.MeshBasicMaterial({color: 0xffffe5})

//portal light
const portalLightMaterial = new THREE.MeshBasicMaterial({color: 0xffffe5})

/**
 * Model
 */
gltfLoader.load(
    'portalmerged.glb',
    (gltf) => 
    {
        const bakedMesh = gltf.scene.children.find(child => child.name === 'baked')
        bakedMesh.material = bakedMaterial

        //finding the emmisive materials
        const portalLightMesh = gltf.scene.children.find(child => child.name === 'portal')
        const poleLightAMesh = gltf.scene.children.find(child => child.name === 'lightemmision')
        const poleLightBMesh = gltf.scene.children.find(child => child.name === 'lightemmision2')

        poleLightAMesh.material = poleLightMaterial
        poleLightBMesh.material = poleLightMaterial
        portalLightMesh.material = portalLightMaterial
        
        scene.add(gltf.scene)
        console.log(gltf.scene)
    }
)

/**
 * Fireflies
 */

//geometry 

const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 80
const positionArray = new Float32Array(firefliesCount * 3)
const scaleArray = new Float32Array(firefliesCount)

for(let i = 0; i < firefliesCount; i++) {

    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 8
    positionArray[i * 3 + 1] = Math.random() * 1.5 + 0.2
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 8

    scaleArray[i] = Math.random()
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray,1))

// material firefly
const firefliesMaterial = new THREE.ShaderMaterial({
    
    uniforms:
    {
        uTime: {value:0},
        uPixelRatio: {value: Math.min(window.devicePixelRatio, 2 )},
        uSize: {value: 88}
    },
    
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    transparent: true,

    blending: THREE.AdditiveBlending,

    depthWrite: false
})

gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(1000).step(1).name('Fireflies Size')

//points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    //update firefly shader
    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)


})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

//FOG
// scene.fog = new THREE.Fog(0x2F342D, 3, 19 );
//commented out



/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//encoding
renderer.outputEncoding = THREE.sRGBEncoding

debugObject.clearColor = '#201919'
renderer.setClearColor(debugObject.clearColor)

gui
    .addColor(debugObject, 'clearColor')
    .onChange(() =>
    {
        renderer.setClearColor(debugObject.clearColor)
    })
/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //uTime shader value updated per tick
    firefliesMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()