import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import {Brush, Evaluator, SUBTRACTION} from 'three-bvh-csg'
import terrainVertexShader from './shaders/terrain/vertex.glsl'
import terrainFragmentShader from './shaders/terrain/fragment.glsl'

import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 325 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const rgbeLoader = new RGBELoader()

/**
 * Environment map
 */
rgbeLoader.load('/spruit_sunrise.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping
    scene.background = environmentMap
    scene.backgroundBlurriness = 0.5
    scene.environment = environmentMap
})

/**
 * Tarrian
 */
//geometry
const geometry = new THREE.PlaneGeometry(10, 10, 500, 500)
geometry.deleteAttribute('uv')
geometry.deleteAttribute('normal')
geometry.rotateX(-Math.PI * .5)

debugObject.colorWaterDeep = '#002b3d'
debugObject.colorWaterSurface = '#66a8ff'
debugObject.colorSand = '#ffe894'
debugObject.colorGrass= '#85d534'
debugObject.colorSnow = '#ffffff'
debugObject.colorRock= '#bfbd8d'


const uniforms = {
    uPositionFrequency: new THREE.Uniform(.2),
    uWarpFrequency: new THREE.Uniform(5.),
    uWarpStrength: new THREE.Uniform(.5),
    uStrength: new THREE.Uniform(2.),
    uTime: new THREE.Uniform(0),
    uTimeSpeed: new THREE.Uniform(0.2),
    uWaterDeepColor: new THREE.Uniform( new THREE.Color(debugObject.colorWaterDeep)),
    uWaterSurfaceColor: new THREE.Uniform( new THREE.Color(debugObject.colorWaterSurface)),
    uSandColor: new THREE.Uniform( new THREE.Color(debugObject.colorSand)),
    uGrassColor: new THREE.Uniform( new THREE.Color(debugObject.colorGrass)),
    uSnowColor: new THREE.Uniform( new THREE.Color(debugObject.colorSnow)),
    uRockColor: new THREE.Uniform( new THREE.Color(debugObject.colorRock)),

 
}

//mateial 
const material = new CustomShaderMaterial({
    baseMaterial: THREE.MeshStandardMaterial,
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    metalness: 0.,
    roughness: .5,
    color: '#85d534',
    uniforms
})
const depthMaterial = new CustomShaderMaterial({
    baseMaterial: THREE.MeshStandardMaterial,
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    uniforms
})

//mesh
const terrian = new THREE.Mesh(geometry, material)
terrian.receiveShadow = true
terrian.castShadow = true
terrian.customDepthMaterial = depthMaterial
scene.add(terrian)

// debug
gui.add(uniforms.uPositionFrequency, 'value').min(0).max(10).step(0.001).name('uPositionFrequency')
gui.add(uniforms.uStrength, 'value').min(0).max(10).step(0.001).name('uStrength')
gui.add(uniforms.uWarpFrequency, 'value').min(0).max(10).step(0.001).name('uWrapFrequency')
gui.add(uniforms.uWarpStrength, 'value').min(0).max(10).step(0.001).name('uWrapStrength')
gui.add(uniforms.uTimeSpeed, 'value').min(0).max(10).step(0.001).name('uTimeSpeed')

gui.addColor( debugObject, 'colorWaterDeep')
   .onChange( () => {uniforms.uWaterDeepColor.value.set(debugObject.colorWaterDeep)})

gui.addColor( debugObject, 'colorWaterDeep')
   .onChange( () => {uniforms.uWaterSurfaceColor.value.set(debugObject.colorWaterSurface)})

 gui.addColor( debugObject, 'colorSand')
   .onChange( () => {uniforms.uSandColor.value.set(debugObject.colorSand)})

gui.addColor( debugObject, 'colorGrass')
   .onChange( () => {uniforms.uGrassColor.value.set(debugObject.colorGrass)})

gui.addColor( debugObject, 'colorSnow')
   .onChange( () => {uniforms.uSnowColor.value.set(debugObject.co)})

gui.addColor( debugObject, 'colorRock')
   .onChange( () => {uniforms.uWaterDeepColor.value.set(debugObject.colorRock)})

/// Brushes
const boardhFill = new Brush(new THREE.BoxGeometry(11, 2, 11))
const boardhHole = new Brush(new THREE.BoxGeometry( 10, 2.5, 10))

/// Evaluator
const evaluator = new Evaluator()
const board = evaluator.evaluate(boardhFill, boardhHole, SUBTRACTION)

board.geometry.clearGroups()
board.material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 1,
    metalness: 0
})
board.castShadow = true
board.receiveShadow = true
scene.add(board)


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(6.25, 3, 4)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 30
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-10, 6, -2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    //uniforms
    uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()