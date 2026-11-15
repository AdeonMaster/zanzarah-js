import {
  LightType,
  RWBinaryFile,
  Scene,
  ZBinaryReader,
} from '@zanzarah.js/engine'
import { RWString, RWTexture } from '@zanzarah.js/engine/rw'
import { Buffer } from 'buffer'
import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js'
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js'
import createEditorNavigationControls from '../helpers/EditorNavigationControls.js'
import { RadiusHelper } from '../helpers/RadiusHelper.js'
import { BSPLoader } from '../loaders/BSPLoader.js'
import DFFLoader from '../loaders/DFFLoader.js'
import { getNestedDirectoryHandle, normalizePath } from '../utils/index.js'
import { TriggerColliderType } from '../../../../engine/src/structures/scn/Trigger.js'
import { MouseBoxHelper } from '../helpers/MouseBoxHelper.js'
import { TransformControls } from 'three/examples/jsm/Addons.js'
import { getLogger } from '../../logger.js'

window.Buffer = Buffer

const textureLoader = new THREE.TextureLoader()
const ddsLoader = new DDSLoader()
const dffLoader = new DFFLoader()
const bspLoader = new BSPLoader()

const raycaster = new THREE.Raycaster()

const logger = getLogger()

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

let rootDirHandle: FileSystemDirectoryHandle

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera

let transformControls: TransformControls

const loadSceneBackdrop = async (backdropFileName: string) => {
  if (!backdropFileName.length) {
    logger.warn(`Backdrop is empty`)
    return
  }

  const match = backdropFileName.match(/^(\d+)/g)
  if (match) {
    logger.log(`dynamic backdrop ${backdropFileName}`)

    switch (parseInt(match[0], 10)) {
      case 2: //Forest
        backdropFileName = 'ebg01h'
        break
      case 3: //Horizon
        backdropFileName = 'sbg01m'
        break
      case 5: //Swamp
        backdropFileName = 'bgsm01p'
        break
      case 7: //Mountain
        backdropFileName = 'msk01f'
        break
      case 10: //Garden
        backdropFileName = 'fbgsm01p'
        break
      default:
        console.error(`Unsupported dynamic backdrop ${backdropFileName}`)
    }
  } else {
    logger.log(`static backdrop ${backdropFileName}`)
  }

  const modelsDirHandler = await rootDirHandle.getDirectoryHandle(
    'models',
    { create: false },
  )
  const backdropsDirHandler = await modelsDirHandler.getDirectoryHandle(
    'backdrops',
    { create: false },
  )

  const backdropFileHandler = await backdropsDirHandler.getFileHandle(
    `${backdropFileName}.dff`,
  )
  const backdropFile = await backdropFileHandler.getFile()
  // const backdropArrayBuffer = await backdropFile.arrayBuffer()
  // const backdropModel = RWBinaryFile.read(new ZBinaryReader(Buffer.from(backdropArrayBuffer)))
  // console.log(backdropModel)

  // const skyModel = await dffLoader.loadAsync(URL.createObjectURL(backdropFile))
  // scene.add(skyModel)

  // const backdropModelTexName = backdropModel[0].findAll(RWTexture)?.[0].findChild(RWString)?.value || ''
  // if (!backdropModelTexName) {
  //   console.log('No texture')
  // }

  // const texturesDirHandler = await resourcesDirHandle.getDirectoryHandle('textures', { create: false })
  // const backdropsTexturesDirHandler = await texturesDirHandler.getDirectoryHandle('backdrops', { create: false })

  // const backdropModelTexFileHandler = await backdropsTexturesDirHandler.getFileHandle(`${backdropModelTexName}.bmp`)
  // const backdropModelTexFile = await backdropModelTexFileHandler.getFile()

  // const skyTexture = await new THREE.TextureLoader().loadAsync(URL.createObjectURL(backdropModelTexFile))
  // const cubeTexture = new THREE.CubeTexture(Array(6).fill(skyTexture.image))
  // cubeTexture.colorSpace = THREE.SRGBColorSpace
  // cubeTexture.needsUpdate = true

  // scene.background = cubeTexture
}

const loadSceneEntities = async (scn: Scene) => {
  
  // samples 3D
  for (const sample3D of scn.samples3D) {
    const gizmoIcon = loadedEditorTextures.get('gizmo:audio')
    const spriteMaterial = new THREE.SpriteMaterial({
      map: gizmoIcon,
      color: 0xffffff,
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(1, 1, 1) // Set world-space dimen

    sprite.position.set(
      sample3D.pos.x,
      sample3D.pos.y,
      sample3D.pos.z,
    )

    scene.add(sprite)
  }

  // effects
  for (const effect of scn.effects) {
    const gizmoIcon = loadedEditorTextures.get('gizmo:effect')
    const spriteMaterial = new THREE.SpriteMaterial({
      map: gizmoIcon,
      color: 0xffffff,
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(1, 1, 1) // Set world-space dimen

    sprite.position.set(
      effect.pos.x,
      effect.pos.y,
      effect.pos.z,
    )

    scene.add(sprite)
  }

  // models
  const modelsDirHandler = await getNestedDirectoryHandle(rootDirHandle, 'resources/models/models')
  for (const model of scn.models) {
    try {
      const modelFileHandler = await modelsDirHandler.getFileHandle(`${model.filename}.dff`)
      const modelFile = await modelFileHandler.getFile()
      const ddfModel = await dffLoader.loadAsync(URL.createObjectURL(modelFile))

      ddfModel.position.set(model.pos.x, model.pos.y, model.pos.z)
      ddfModel.rotation.copy(new THREE.Euler(model.rot.x, model.rot.y, model.rot.z, 'XYZ'))
      
      scene.add(ddfModel)
    } catch(e) {
      logger.error(e)
    }
  }

  // fo models
  for (const foModel of scn.foModels) {
    try {
      const modelFileHandler = await modelsDirHandler.getFileHandle(`${foModel.filename}.dff`)
      const modelFile = await modelFileHandler.getFile()
      const ddfModel = await dffLoader.loadAsync(URL.createObjectURL(modelFile))

      ddfModel.position.set(foModel.pos.x, foModel.pos.y, foModel.pos.z)
      ddfModel.rotation.copy(new THREE.Euler(foModel.rot.x, foModel.rot.y, foModel.rot.z, 'XYZ'))
      
      scene.add(ddfModel)
    } catch(e) {
      logger.error(e)
    }
  }

  // triggers
  for (const trigger of scn.triggers) {
    const gizmoIcon = loadedEditorTextures.get('gizmo:trigger')
    const spriteMaterial = new THREE.SpriteMaterial({
      map: gizmoIcon,
      color: 0xffffff,
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(1, 1, 1) // Set world-space dimen

    sprite.position.set(
      trigger.pos.x,
      trigger.pos.y,
      trigger.pos.z,
    )

    if (trigger.colliderType === TriggerColliderType.Sphere) {
      const radiusHelper = new RadiusHelper(trigger.radius)
      sprite.add(radiusHelper)
    } else {
      const box = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(trigger.end.x - trigger.pos.x, trigger.end.y - trigger.pos.y, trigger.end.z - trigger.pos.z))
      const helper = new THREE.Box3Helper(box, 0x80a676)
      sprite.add(helper)
    }

    scene.add(sprite)
  }
}

export const loadScene = async () => {
  try {
    rootDirHandle = await window.showDirectoryPicker()
  } catch (e) {
    logger.error(e)
    return
  }

  const worldsDirHandler = await getNestedDirectoryHandle(
    rootDirHandle,
    'Resources/Worlds',
    { create: false },
  )
  const entries = []
  for await (const [name, handle] of worldsDirHandler.entries()) {
    entries.push({ name, kind: handle.kind, handle })
  }

  logger.log(entries)

  logger.log('Loading scene..')

  const scnFileHandle = await worldsDirHandler.getFileHandle('sc_2421.scn')
  const scnFile = await scnFileHandle.getFile()
  const scnArrayBuffer = await scnFile.arrayBuffer()
  const scn = Scene.read(new ZBinaryReader(Buffer.from(scnArrayBuffer)))
  logger.log(scn)

  //await loadSceneBackdrop(scn.backdropFile)

  const normalizedWorldPath = normalizePath(scn.misc.worldPath)
  // const normalizedTexturePath = normalizePath(scn.misc.texturePath)
  const bsp = await bspLoader.loadAsync(
    rootDirHandle,
    `${normalizedWorldPath}/${scn.misc.worldFile}.bsp`,
  )
  scene.add(bsp)

  await loadSceneEntities(scn)

  camera.position.set(scn.sceneOrigin.x, scn.sceneOrigin.y, scn.sceneOrigin.z) //this freeze the renderer
  camera.lookAt(scn.sceneOrigin.x, scn.sceneOrigin.y, scn.sceneOrigin.z)

  logger.log('Scene loaded!')
}

export const mountRenderer = async (
  container: HTMLElement,
): Promise<() => void> => {
  // load editor textures
  for (const [key, url] of editorTextures) {
    const iconTexture = await textureLoader.loadAsync(url)
    iconTexture.magFilter = THREE.NearestFilter

    loadedEditorTextures.set(key, iconTexture)
  }

  // create scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x69625d)
  scene.fog = new THREE.Fog(0xcccccc, 10, 88)

  // axes helper
  const axesHelper = new THREE.AxesHelper(5)
  // axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
  axesHelper.setColors(0xFF4466, 0x88FF44, 0x4488FF)
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
  camera = new THREE.PerspectiveCamera(
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

  // transform controls
  transformControls = new TransformControls(camera, renderer.domElement)
  transformControls.enabled = false
  transformControls.setColors(0xFF4466, 0x88FF44, 0x4488FF, 0xFFFFFF)
  scene.add(transformControls.getHelper())

  // mouseHelper
  const mouseHelper = new MouseBoxHelper(renderer, 24)

  // controls
  const navigationControls = createEditorNavigationControls(
    camera,
    renderer.domElement,
  )

  // rendering
  const timer = new THREE.Timer()
  timer.connect(document)

  let frameId = 0

  const render = (timestamp: number) => {
    frameId = requestAnimationFrame(render)

    timer.update(timestamp)
    const delta = Math.min(timer.getDelta(), 0.05)

    navigationControls.update(delta)

    gridHelper.position.x =
      Math.floor(camera.position.x / gridHelperSize) * gridHelperCellSize
    gridHelper.position.z =
      Math.floor(camera.position.z / gridHelperSize) * gridHelperCellSize

    if (viewHelper.animating) {
      viewHelper.update(delta)
    }

    renderer.render(scene, camera)
    viewHelper.render(renderer)

    mouseHelper.render()
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

  const handleClick = () => {
    const x = (mouseHelper.mouse.x / container.clientWidth) * 2 - 1
    const y = -(mouseHelper.mouse.y / container.clientHeight) * 2 + 1

    raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
    const intersects = raycaster.intersectObjects(scene.children, true)
    if (intersects.length > 0) {
        // 3. The closest hit object
        const clickedMesh = intersects[0].object
        logger.log('Clicked object:', clickedMesh)

        transformControls.attach(clickedMesh)
    } else {
      transformControls.detach()
    }
  }

  renderer.domElement.addEventListener('click', handleClick)

  return () => {
    renderer.domElement.removeEventListener('click', handleClick)

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

  // const mouse = new THREE.Vector2()

  // const onPoinerMove = (event: PointerEvent) => {
  //   mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  //   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
  // }

  // const onClick = () => {
  //   // raycaster.setFromCamera(mouse, camera)
  //   // const intersects = raycaster.intersectObjects(scene.children, true)
  //   // if (intersects.length > 0) {
  //   //     // 3. The closest hit object
  //   //     const clickedMesh = intersects[0].object
  //   //     console.log('Clicked object:', clickedMesh)
  //   // }
  // }

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
