import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { Vector3 } from '../math/Vector3.ts'
import { Version } from '../Version.ts'
import { Behavior } from './Behavior.ts'
import { Dataset } from './Dataset.ts'
import { DynModel } from './DynModel.ts'
import { FOModel } from './FOModel.ts'
import { Light } from './Light.ts'
import { Misc } from './Misc.ts'
import { Model } from './Model.ts'
import { Sample2D } from './Sample2D.ts'
import { Sample3D } from './Sample3D.ts'
import { SceneEffectV2 } from './SceneEffectV2.ts'
import { SceneItem } from './SceneItem.ts'
import { TextureProperty } from './TextureProperty.ts'
import { Trigger } from './Trigger.ts'
import { VertexModifier } from './VertexModifier.ts'
import { WaypointSystem } from './WaypointSystem.ts'

type ReadableClass<T> = {
  read(handler: ZBinaryReader): T
}

const readArray = <T>(
  handler: ZBinaryReader,
  classRef: ReadableClass<T>,
): T[] => {
  const totalElements = handler.readUInt32()
  const array = new Array<T>(totalElements)
  for (let i = 0; i < totalElements; ++i) {
    array[i] = classRef.read(handler)
  }

  return array
}

export class Scene {
  version: Version
  misc: Misc
  lights: Light[]
  foModels: FOModel[]
  models: Model[]
  dynModels: DynModel[]
  triggers: Trigger[]
  samples3D: Sample3D[]
  samples2D: Sample2D[]
  backdropFile: string
  ambientSound: number
  music: number
  effectsV1: any[]
  effectsV2: SceneEffectV2[]
  sceneItems: SceneItem[]
  vertexModifiers: VertexModifier[]
  behaviors: Behavior[]
  dataset: Dataset
  sceneOrigin: Vector3
  textureProperties: TextureProperty[]
  waypointSystem: WaypointSystem

  constructor() {
    this.version = new Version()
    this.misc = new Misc()
    this.lights = []
    this.foModels = []
    this.models = []
    this.dynModels = []
    this.triggers = []
    this.samples3D = []
    this.samples2D = []
    this.backdropFile = ''
    this.ambientSound = 0
    this.music = 0
    this.effectsV1 = []
    this.effectsV2 = []
    this.sceneItems = []
    this.vertexModifiers = []
    this.behaviors = []
    this.dataset = new Dataset()
    this.sceneOrigin = new Vector3()
    this.textureProperties = []
    this.waypointSystem = new WaypointSystem()
  }

  write(handler: ZBinaryWriter) {
    throw new Error('Scene.write: Not implemented yet')
  }

  static read(handler: ZBinaryReader) {
    const magicSectionName = handler.readZString()
    if (magicSectionName !== '[Scenefile]')
      throw new Error('Scene.read: Magic section name missing in scene file')

    const instance = new this()

    let stopParsing = false
    while (!stopParsing) {
      const sectionName = handler.readZString()
      switch (sectionName) {
        case '[Version]':
          instance.version = Version.read(handler)
          break
        case '[Misc]':
          instance.misc = Misc.read(handler)
          break
        case '[Lights]':
          instance.lights = readArray(handler, Light)
          break
        case '[FOModels_v4]':
          instance.foModels = readArray(handler, FOModel)
          break
        case '[Models_v3]':
          instance.models = readArray(handler, Model)
          break
        case '[DynamicModels]':
          instance.dynModels = readArray(handler, DynModel)
          break
        case '[Triggers]':
          instance.triggers = readArray(handler, Trigger)
          break
        case '[3DSamples_v2]':
          instance.samples3D = readArray(handler, Sample3D)
          break
        case '[2DSamples_v2]':
          instance.samples2D = readArray(handler, Sample2D)
          break
        case '[Backdrop]':
          instance.backdropFile = handler.readZString()
          break
        case '[AmbientSound]':
          instance.ambientSound = handler.readUInt32()
          break
        case '[Music]':
          instance.music = handler.readUInt32()
          break
        case '[Effects_v2]':
          instance.effectsV2 = readArray(handler, SceneEffectV2)
          break
        case '[Scene]':
          instance.sceneItems = readArray(handler, SceneItem)
          break
        case '[VertexModifiers]':
          instance.vertexModifiers = readArray(handler, VertexModifier)
          break
        case '[Behaviours]':
          instance.behaviors = readArray(handler, Behavior)
          break
        case '[Dataset]':
          instance.dataset = Dataset.read(handler)
          break
        case '[SceneOrigin]':
          instance.sceneOrigin = handler.readVector3()
          break
        case '[TextureProperties]':
          instance.textureProperties = readArray(handler, TextureProperty)
          break
        case '[WaypointSystem]':
          instance.waypointSystem = WaypointSystem.read(handler)
          break
        case '[EOS]':
          stopParsing = true
          break
        default:
          throw new Error(`Scene.read: Invalid scene section "${sectionName}"`)
      }
    }

    return instance
  }
}
