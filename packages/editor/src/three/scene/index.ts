import {
  LightType,
  RWBinaryFile,
  Scene,
  TriggerType,
  ZBinaryReader,
} from '@zanzarah.js/engine'
import { RWString, RWTexture } from '@zanzarah.js/engine/rw'
import { Buffer } from 'buffer'
import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js'
import { DDSLoader } from 'three/addons/loaders/DDSLoader.js'
import { TransformControls } from 'three/examples/jsm/Addons.js'
import { TriggerColliderType } from '../../../../engine/src/structures/scn/Trigger.js'
import { getLogger } from '../../logger.js'
import createEditorNavigationControls from '../helpers/EditorNavigationControls.js'
import { MouseBoxHelper } from '../helpers/MouseBoxHelper.js'
import { RadiusHelper } from '../helpers/RadiusHelper.js'
import { BSPLoader } from '../loaders/BSPLoader.js'
import DFFLoader from '../loaders/DFFLoader.js'
import { getNestedDirectoryHandle, normalizePath } from '../utils/index.js'

window.Buffer = Buffer

const textureLoader = new THREE.TextureLoader()
const ddsLoader = new DDSLoader()
const dffLoader = new DFFLoader()
  .setModelPath('resources/models/models')
  .setTexturePath('resources/textures/models')
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
  ['gizmo:directional-light', 'icons/gizmo/directional-light.png'],
  ['gizmo:point-light', 'icons/gizmo/point-light.png'],
  ['gizmo:audio', 'icons/gizmo/audio.png'],
  ['gizmo:effect', 'icons/gizmo/effect.png'],
  ['gizmo:trigger', 'icons/gizmo/trigger.png'],
  ['gizmo:trigger-death', 'icons/gizmo/trigger-death.png'],
  ['gizmo:trigger-door', 'icons/gizmo/trigger-door.png'],
  ['gizmo:trigger-attack', 'icons/gizmo/trigger-attack.png'],
  ['gizmo:trigger-camera', 'icons/gizmo/trigger-camera.png'],
  ['gizmo:trigger-animal', 'icons/gizmo/trigger-animal.png'],
  ['gizmo:trigger-animal-waypoint', 'icons/gizmo/trigger-animal-waypoint.png'],
  ['gizmo:trigger-waypoint', 'icons/gizmo/trigger-waypoint.png'],
  ['gizmo:waypoint', 'icons/gizmo/waypoint.png'],
])

const loadedEditorTextures = new Map<string, THREE.Texture>()

let rootDirHandle: FileSystemDirectoryHandle

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera

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
        logger.error(`Unsupported dynamic backdrop ${backdropFileName}`)
    }
  } else {
    logger.log(`static backdrop ${backdropFileName}`)
  }

  const modelsDirHandler = await rootDirHandle.getDirectoryHandle('models', {
    create: false,
  })
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
  // logger.log(backdropModel)

  // const skyModel = await dffLoader.loadAsync(URL.createObjectURL(backdropFile))
  // scene.add(skyModel)

  // const backdropModelTexName = backdropModel[0].findAll(RWTexture)?.[0].findChild(RWString)?.value || ''
  // if (!backdropModelTexName) {
  //   logger.log('No texture')
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

    sprite.position.set(sample3D.pos.x, sample3D.pos.y, sample3D.pos.z)

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

    sprite.position.set(effect.pos.x, effect.pos.y, effect.pos.z)

    scene.add(sprite)
  }

  // models
  for (const model of scn.models) {
    try {
      const ddfModel = await dffLoader.loadAsync(
        rootDirHandle,
        `${model.filename}.dff`,
      )

      ddfModel.position.set(model.pos.x, model.pos.y, model.pos.z)
      ddfModel.lookAt(
        ddfModel.position
          .clone()
          .add(new THREE.Vector3(model.rot.x, model.rot.y, model.rot.z)),
      )

      scene.add(ddfModel)
    } catch (e) {
      logger.error(e)
    }
  }

  // fo models
  for (const foModel of scn.foModels) {
    try {
      const ddfModel = await dffLoader.loadAsync(
        rootDirHandle,
        `${foModel.filename}.dff`,
      )

      ddfModel.position.set(foModel.pos.x, foModel.pos.y, foModel.pos.z)
      ddfModel.lookAt(
        ddfModel.position
          .clone()
          .add(new THREE.Vector3(foModel.rot.x, foModel.rot.y, foModel.rot.z)),
      )

      logger.log(foModel.worldDetailLevel)

      scene.add(ddfModel)
    } catch (e) {
      logger.error(e)
    }
  }

  // triggers
  for (const trigger of scn.triggers) {
    let gizmoIconName = 'gizmo:trigger'
    switch (trigger.type) {
      case TriggerType.Doorway:
        gizmoIconName = 'gizmo:trigger-door'
        break
      case TriggerType.NpcAttackPosition:
        gizmoIconName = 'gizmo:trigger-attack'
        break
      case TriggerType.CameraPosition:
        gizmoIconName = 'gizmo:trigger-camera'
        break
      case TriggerType.Animal:
        gizmoIconName = 'gizmo:trigger-animal'
        break
      case TriggerType.AnimalWaypoint:
        gizmoIconName = 'gizmo:trigger-animal-waypoint'
        break
      case TriggerType.Waypoint:
        gizmoIconName = 'gizmo:trigger-waypoint'
        break
    }

    const gizmoIcon = loadedEditorTextures.get(gizmoIconName)
    const spriteMaterial = new THREE.SpriteMaterial({
      map: gizmoIcon,
      color: 0xffffff,
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(1, 1, 1) // Set world-space dimen

    sprite.position.set(trigger.pos.x, trigger.pos.y, trigger.pos.z)

    if (trigger.colliderType === TriggerColliderType.Sphere) {
      const radiusHelper = new RadiusHelper(trigger.radius)
      sprite.add(radiusHelper)
    } else if (trigger.colliderType === TriggerColliderType.Box) {
      const box = new THREE.Box3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          trigger.end.x - trigger.pos.x,
          trigger.end.y - trigger.pos.y,
          trigger.end.z - trigger.pos.z,
        ),
      )
      const helper = new THREE.Box3Helper(box, 0x80a676)
      sprite.add(helper)
    } else {
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
  signal?: AbortSignal,
): Promise<() => void> => {
  if (signal?.aborted) return () => {}

  // load editor textures
  for (const [key, url] of editorTextures) {
    const iconTexture = await textureLoader.loadAsync(url)
    iconTexture.magFilter = THREE.NearestFilter

    loadedEditorTextures.set(key, iconTexture)
  }

  // A component can unmount while the textures above are loading (React
  // StrictMode does this deliberately in development). Do not create a
  // renderer or start an animation loop for that abandoned mount.
  if (signal?.aborted) return () => {}

  // create scene
  const mountScene = new THREE.Scene()
  scene = mountScene
  mountScene.background = new THREE.Color(0x69625d)
  mountScene.fog = new THREE.Fog(0xcccccc, 10, 88)

  // axes helper
  const axesHelper = new THREE.AxesHelper(5)
  // axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
  axesHelper.setColors(0xff4466, 0x88ff44, 0x4488ff)
  axesHelper.material.fog = false
  axesHelper.material.depthWrite = false
  axesHelper.renderOrder = 2
  mountScene.add(axesHelper)

  // grid helper
  const gridHelperSize = 1000
  const gridHelperDivisions = 100
  const gridHelperCellSize = gridHelperSize / gridHelperDivisions
  const gridHelper = new THREE.GridHelper(gridHelperSize, gridHelperDivisions)
  gridHelper.material.depthWrite = false
  gridHelper.renderOrder = 1
  mountScene.add(gridHelper)

  // ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  mountScene.add(ambientLight)

  // camera
  const mountCamera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    2000,
  )
  camera = mountCamera
  mountCamera.position.set(0, 2, 8)
  mountCamera.lookAt(0, 0, 0)

  // view helper
  const viewHelper = new ViewHelper(mountCamera, container)
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
  const mountTransformControls = new TransformControls(
    mountCamera,
    renderer.domElement,
  )
  mountTransformControls.enabled = false
  mountTransformControls.setColors(0xff4466, 0x88ff44, 0x4488ff, 0xffffff)
  mountScene.add(mountTransformControls.getHelper())

  // mouseHelper
  const mouseHelper = new MouseBoxHelper(renderer, 24)

  // controls
  const navigationControls = createEditorNavigationControls(
    mountCamera,
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
      Math.floor(mountCamera.position.x / gridHelperSize) * gridHelperCellSize
    gridHelper.position.z =
      Math.floor(mountCamera.position.z / gridHelperSize) * gridHelperCellSize

    if (viewHelper.animating) {
      viewHelper.update(delta)
    }

    renderer.render(mountScene, mountCamera)
    viewHelper.render(renderer)

    mouseHelper.render()
  }

  frameId = requestAnimationFrame(render)

  const resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry) return

    const { width, height } = entry.contentRect
    if (width <= 0 || height <= 0) return

    renderer.setSize(width, height, false)

    mountCamera.aspect = width / height
    mountCamera.updateProjectionMatrix()
  })

  resizeObserver.observe(container)

  const handleClick = () => {
    const x = (mouseHelper.mouse.x / container.clientWidth) * 2 - 1
    const y = -(mouseHelper.mouse.y / container.clientHeight) * 2 + 1

    raycaster.setFromCamera(new THREE.Vector2(x, y), mountCamera)
    const intersects = raycaster.intersectObjects(mountScene.children, true)
    if (intersects.length > 0) {
      // 3. The closest hit object
      const clickedMesh = intersects[0].object
      logger.log('Clicked object:', clickedMesh)

      mountTransformControls.attach(clickedMesh)
    } else {
      mountTransformControls.detach()
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
