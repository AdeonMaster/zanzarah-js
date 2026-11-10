import { LightType, Scene, ZBinaryReader } from '@zanzarah.js/engine'
import { Buffer } from 'buffer'
import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js'
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js'
import { RadiusHelper } from './helpers/RadiusHelper.js'
import { BSPLoader } from './loaders/BSPLoader.js'
import DFFLoader from './loaders/DFFLoader.js'
import createEditorNavigationControls from './helpers/EditorNavigationControls.js'

window.Buffer = Buffer

const textureLoader = new THREE.TextureLoader()

const raycaster = new THREE.Raycaster()

// const loadScene = async (
//   scene: THREE.Scene,
//   ambientLight: THREE.AmbientLight
// ) => {
//   ambientLight.color.set(scn.misc.ambientLight.toIColor().raw())

//   scn.lights.forEach((entity) => {
//     const gizmoDirectionalLightIcon = loadedTextures.get(
//       'gizmo:directional-light',
//     )

//     if (entity.type === LightType.Directional) {
//       const color = entity.color.toIColor().raw()

//       const spriteMaterial = new THREE.SpriteMaterial({
//         map: gizmoDirectionalLightIcon,
//         color,
//       })
//       const sprite = new THREE.Sprite(spriteMaterial)
//       sprite.scale.set(1, 1, 1) // Set world-space dimen

//       const light = new THREE.DirectionalLight(color, 2)
//       light.add(sprite)

//       light.position.set(
//         entity.pos.x,
//         entity.pos.y,
//         entity.pos.z,
//       )

//       light.target.position.set(entity.pos.x, entity.pos.y, entity.pos.z)
//       light.target.position.add(
//         new THREE.Vector3(
//           entity.vec.x,
//           entity.vec.y,
//           entity.vec.z,
//         ).multiplyScalar(10.0),
//       )

//       scene.add(light)

//       const lightHelper = new THREE.DirectionalLightHelper(light, 1)
//       scene.add(lightHelper)
//     }
//   })

//   scn.foModels.forEach(async (entity) => {
//     const geometry = new THREE.BoxGeometry()
//     const material = new THREE.MeshStandardMaterial({
//       color: entity.color.raw(),
//     })
//     const cube = new THREE.Mesh(geometry, material)

//     cube.position.set(
//       entity.pos.x,
//       entity.pos.y,
//       entity.pos.z,
//     )

//     scene.add(cube)
//   })

//   scn.models.forEach(async(entity) => {
//     const geometry = new THREE.BoxGeometry()
//     const material = new THREE.MeshStandardMaterial({
//       color: entity.color.raw(),
//     })
//     const cube = new THREE.Mesh(geometry, material)

//     cube.position.set(
//       entity.pos.x,
//       entity.pos.y,
//       entity.pos.z,
//     )

//     scene.add(cube)
//   })

//   scn.samples3D.forEach((entity) => {
//     const gizmoIcon = loadedTextures.get('gizmo:audio')
//     const spriteMaterial = new THREE.SpriteMaterial({
//       map: gizmoIcon,
//       color: 0xffffff,
//     })
//     const sprite = new THREE.Sprite(spriteMaterial)
//     sprite.scale.set(1, 1, 1) // Set world-space dimen

//     sprite.position.set(
//       entity.pos.x,
//       entity.pos.y,
//       entity.pos.z,
//     )

//     scene.add(sprite)
//   })

//   scn.effects.forEach((entity) => {
//     const gizmoIcon = loadedTextures.get('gizmo:effect')
//     const spriteMaterial = new THREE.SpriteMaterial({
//       map: gizmoIcon,
//       color: 0xffffff,
//     })
//     const sprite = new THREE.Sprite(spriteMaterial)
//     sprite.scale.set(1, 1, 1) // Set world-space dimen

//     sprite.position.set(
//       entity.pos.x,
//       entity.pos.y,
//       entity.pos.z,
//     )

//     scene.add(sprite)
//   })

//   scn.triggers.forEach((trigger) => {
//     if (trigger.radius > 0.0) {
//       const gizmoIcon = loadedTextures.get('gizmo:trigger')
//       const spriteMaterial = new THREE.SpriteMaterial({
//         map: gizmoIcon,
//         color: 0xffffff,
//       })
//       const sprite = new THREE.Sprite(spriteMaterial)
//       sprite.scale.set(1, 1, 1) // Set world-space dimen

//       sprite.position.set(
//         trigger.pos.x,
//         trigger.pos.y,
//         trigger.pos.z,
//       )

//       const radiusHelper = new RadiusHelper(trigger.radius)
//       sprite.add(radiusHelper)

//       scene.add(sprite)
//     }
//   })

//   scn.waypointSystem.waypoints.map((waypoint) => {
//     const gizmoIcon = loadedTextures.get('gizmo:waypoint')
//     const spriteMaterial = new THREE.SpriteMaterial({
//       map: gizmoIcon,
//       color: 0xffffff,
//     })
//     const sprite = new THREE.Sprite(spriteMaterial)
//     sprite.scale.set(1, 1, 1) // Set world-space dimen

//     sprite.position.set(
//       waypoint.pos.x,
//       waypoint.pos.y,
//       waypoint.pos.z,
//     )

//     scene.add(sprite)
//   })
// }

const editorTextures = new Map<string, string>([
  ['gizmo:directional-light', 'icons/directional-light.png'],
  ['gizmo:point-light', 'icons/point-light.png'],
  ['gizmo:audio', 'icons/audio.png'],
  ['gizmo:effect', 'icons/effect.png'],
  ['gizmo:trigger', 'icons/trigger.png'],
  ['gizmo:waypoint', 'icons/waypoint.png'],
])

const loadedEditorTextures = new Map<string, THREE.Texture>()

const loadScene = (name: string) => {

}

export const mountRenderer = async (container: HTMLElement): Promise<() => void> => {
  // load editor textures
  for (const [key, url] of editorTextures) {
    const iconTexture = await textureLoader.loadAsync(url)
    iconTexture.magFilter = THREE.NearestFilter

    loadedEditorTextures.set(key, iconTexture)
  }

  // create scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x69625D)
  scene.fog = new THREE.Fog(0xcccccc, 10, 88)

  // axes helper
  const axesHelper = new THREE.AxesHelper(5)
  axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
  axesHelper.material.fog = false
  axesHelper.material.depthWrite = false
  axesHelper.renderOrder = 2
  scene.add(axesHelper)

  // grid helper
  const gridHelperSize = 1000
  const gridHelperDivisions = 100
  const gridHelperCellSize = gridHelperSize / gridHelperDivisions
  const gridHelper = new THREE.GridHelper(gridHelperSize, gridHelperDivisions)
  gridHelper.material.depthWrite = false
  gridHelper.renderOrder = 1
  scene.add(gridHelper)

  // ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)

  // camera
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    2000,
  )
  camera.position.set(0, 2, 8)
  camera.lookAt(0, 0, 0)

  // view helper
  const viewHelper = new ViewHelper(camera, container)
  viewHelper.location.top = 0
  viewHelper.location.right = 0

  // renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight, false)
  renderer.autoClear = false
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.display = 'block'
  container.appendChild(renderer.domElement)

  // controls
  const navigationControls = createEditorNavigationControls(camera, renderer.domElement)

  // rendering
  const timer = new THREE.Timer()
  timer.connect(document)

  let frameId = 0

  const render = (timestamp: number) => {
    frameId = requestAnimationFrame(render)

    timer.update(timestamp)
    const delta = Math.min(timer.getDelta(), 0.05)

    navigationControls.update(delta)

    gridHelper.position.x = Math.floor(camera.position.x / gridHelperSize) * gridHelperCellSize
    gridHelper.position.z = Math.floor(camera.position.z / gridHelperSize) * gridHelperCellSize

    if (viewHelper.animating) {
      viewHelper.update(delta)
    }

    renderer.render(scene, camera)
    viewHelper.render(renderer)
  }

  frameId = requestAnimationFrame(render)

  const resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return

    const { width, height } = entry.contentRect
    if (width <= 0 || height <= 0) return

    renderer.setSize(width, height, false)

    camera.aspect = width / height
    camera.updateProjectionMatrix()
  })

  resizeObserver.observe(container)

  return () => {
    cancelAnimationFrame(frameId)
    resizeObserver.disconnect()
    timer.dispose()

    navigationControls.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}

// export async function mountScene2(container: HTMLElement): Promise<() => void> {
 

//   // const bspLoader = new BSPLoader()
//   // const bspFile = await bspLoader.loadAsync('data/RESOURCES/WORLDS/SC_2421.BSP') //'SC_0210.BSP'
//   // console.log(bspFile)

//   const fileLoader = new THREE.FileLoader()
//   fileLoader.setResponseType('arraybuffer')

//   // const sceneFile = (await fileLoader.loadAsync('data/RESOURCES/WORLDS/sc_2421.scn')) as ArrayBuffer
//   // const reader = new ZBinaryReader(Buffer.from(sceneFile))
//   // const scn = Scene.read(reader)

//   const ddsLoader = new DDSLoader()
//   const ddsTexture = await ddsLoader.loadAsync('data/RESOURCES/TEXTURES/BACKDROPS/FBG00TA.DDS')

//   const mip = ddsTexture.mipmaps[0]
//   const imageData = new ImageData(
//     new Uint8ClampedArray(mip.data),
//     mip.width,
//     mip.height,
//   )
//   const image = await createImageBitmap(imageData)

//   const cubeTexture = new THREE.CubeTexture(Array(6).fill(image))
//   cubeTexture.colorSpace = THREE.SRGBColorSpace
//   cubeTexture.needsUpdate = true

//   scene.background = cubeTexture

 
//   // scene.add(bspFile)


//   const onViewHelperPointerUp = (event: PointerEvent) => {
//     if (event.button === 0) {
//       viewHelper.handleClick(event)
//     }
//   }

//   container.addEventListener('pointerup', onViewHelperPointerUp)

//   let isRightMouseDown = false

//   const onMouseDown = (event: MouseEvent) => {
//     if (event.button !== 2) return

//     isRightMouseDown = true
//     controls.lock()
//   }

//   const onMouseUp = (event: MouseEvent) => {
//     if (event.button !== 2) return

//     isRightMouseDown = false
//     controls.unlock()
//   }

//   const onContextMenu = (event: MouseEvent) => {
//     event.preventDefault()
//   }

//   let speed = 10

//   const onMouseWheel = (event: WheelEvent) => {
//     if (event.deltaY < 0) {
//       if (speed < 100) {
//         speed += 10
//       }
//     } else {
//       if (speed > 0) {
//         speed -= 10
//       }
//     }
//   }

//   const mouse = new THREE.Vector2()

//   const onPoinerMove = (event: PointerEvent) => {
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
//   }

//   const onClick = () => {
//     // raycaster.setFromCamera(mouse, camera)
//     // const intersects = raycaster.intersectObjects(scene.children, true)
//     // if (intersects.length > 0) {
//     //     // 3. The closest hit object
//     //     const clickedMesh = intersects[0].object
//     //     console.log('Clicked object:', clickedMesh)
//     // }
//   }

//   const onDoubleClick = () => {
//     raycaster.setFromCamera(mouse, camera)

//     const intersects = raycaster.intersectObjects(scene.children, true)

//     if (intersects.length > 0) {
//       // 3. The closest hit object
//       const clickedMesh = intersects[0].object

//       console.log('DB Clicked object:', clickedMesh)

//       camera.position.copy(clickedMesh.position)
//     }
//   }

//   renderer.domElement.addEventListener('mousedown', onMouseDown)
//   renderer.domElement.addEventListener('wheel', onMouseWheel)
//   window.addEventListener('mouseup', onMouseUp)
//   window.addEventListener('pointermove', onPoinerMove)
//   window.addEventListener('click', onClick)
//   window.addEventListener('dblclick', onDoubleClick)
//   renderer.domElement.addEventListener('contextmenu', onContextMenu)

//   const keys = new Set<string>()

//   const onKeyDown = (event: KeyboardEvent) => keys.add(event.code)
//   const onKeyUp = (event: KeyboardEvent) => keys.delete(event.code)

//   window.addEventListener('keydown', onKeyDown)
//   window.addEventListener('keyup', onKeyUp)

//   // await loadScene(scene, ambientLight)

//   const animate = (timestamp: number) => {
//     if (controls.isLocked && isRightMouseDown) {
//       let forward = 0
//       let right = 0

//       if (keys.has('KeyW')) forward += 1
//       if (keys.has('KeyS')) forward -= 1
//       if (keys.has('KeyD')) right += 1
//       if (keys.has('KeyA')) right -= 1

//       const length = Math.hypot(forward, right) || 1
//       forward /= length
//       right /= length

//       controls.moveForward(forward * speed * delta)
//       controls.moveRight(right * speed * delta)

//       if (keys.has('Space')) camera.position.y += speed * delta
//       if (keys.has('ShiftLeft')) camera.position.y -= speed * delta
//     }

//   }

//   return () => {
//     container.removeEventListener('pointerup', onViewHelperPointerUp)

//     renderer.domElement.removeEventListener('mousedown', onMouseDown)
//     renderer.domElement.removeEventListener('wheel', onMouseWheel)
//     window.removeEventListener('mouseup', onMouseUp)
//     window.removeEventListener('pointermove', onPoinerMove)
//     window.removeEventListener('click', onClick)
//     window.removeEventListener('dblclick', onDoubleClick)
//     renderer.domElement.removeEventListener('contextmenu', onContextMenu)

//     window.removeEventListener('keydown', onKeyDown)
//     window.removeEventListener('keyup', onKeyUp)
//   }
// }
