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
import { SceneEffect, SceneEffectReadVersion } from './SceneEffect.ts'
import { SceneItem } from './SceneItem.ts'
import { TextureProperty } from './TextureProperty.ts'
import { Trigger } from './Trigger.ts'
import { VertexModifier } from './VertexModifier.ts'
import { WaypointSystem } from './WaypointSystem.ts'

type ReadableClass<T> = {
  read(handler: ZBinaryReader): T
}

type WriteableClass<T> = {
  write(handler: ZBinaryWriter): T
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

const writeArray = <T>(handler: ZBinaryWriter, items: WriteableClass<T>[]) => {
  handler.writeUInt32(items.length)
  for (let i = 0; i < items.length; ++i) {
    items[i].write(handler)
  }
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
  effects: SceneEffect[]
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
    this.effects = []
    this.sceneItems = []
    this.vertexModifiers = []
    this.behaviors = []
    this.dataset = new Dataset()
    this.sceneOrigin = new Vector3()
    this.textureProperties = []
    this.waypointSystem = new WaypointSystem()
  }

  write(handler: ZBinaryWriter) {
    handler.writeZString('[Scenefile]')
    handler.writeZString('[Version]')
    this.version.write(handler)
    handler.writeZString('[Misc]')
    this.misc.write(handler)
    handler.writeZString('[Lights]')
    writeArray(handler, this.lights)
    handler.writeZString('[FOModels_v4]')
    writeArray(handler, this.foModels)
    handler.writeZString('[Models_v3]')
    writeArray(handler, this.models)
    handler.writeZString('[DynamicModels]')
    writeArray(handler, this.dynModels)
    handler.writeZString('[Triggers]')
    writeArray(handler, this.triggers)
    handler.writeZString('[3DSamples_v2]')
    writeArray(handler, this.samples3D)
    handler.writeZString('[2DSamples_v2]')
    writeArray(handler, this.samples2D)
    handler.writeZString('[AmbientSound]')
    handler.writeUInt32(this.ambientSound)
    handler.writeZString('[Music]')
    handler.writeUInt32(this.music)
    handler.writeZString('[Effects]')
    writeArray(
      handler,
      this.effects.filter(
        (effect) => effect.readVersion === SceneEffectReadVersion.V1,
      ),
    )
    handler.writeZString('[Effects_v2]')
    writeArray(
      handler,
      this.effects.filter(
        (effect) => effect.readVersion === SceneEffectReadVersion.V2,
      ),
    )
    handler.writeZString('[Scene]')
    writeArray(handler, this.sceneItems)
    handler.writeZString('[VertexModifiers]')
    writeArray(handler, this.vertexModifiers)
    handler.writeZString('[Behaviours]')
    writeArray(handler, this.behaviors)
    handler.writeZString('[Dataset]')
    this.dataset.write(handler)
    handler.writeZString('[SceneOrigin]')
    handler.writeVector3(this.sceneOrigin)
    handler.writeZString('[TextureProperties]')
    writeArray(handler, this.textureProperties)
    handler.writeZString('[WaypointSystem]')
    this.waypointSystem.write(handler)
    if (this.backdropFile.length > 0) {
      handler.writeZString('[Backdrop]')
      handler.writeZString(this.backdropFile)
    }
    handler.writeZString('[EOS]')
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
        case '[Effects_v2]': {
          const totalElements = handler.readUInt32()
          const array = new Array<SceneEffect>(totalElements)
          for (let i = 0; i < totalElements; ++i) {
            array[i] = SceneEffect.read(handler, SceneEffectReadVersion.V2)
          }
          instance.effects = [...instance.effects, ...array]
          break
        }
        case '[Effects]': {
          const totalElements = handler.readUInt32()
          const array = new Array<SceneEffect>(totalElements)
          for (let i = 0; i < totalElements; ++i) {
            array[i] = SceneEffect.read(handler, SceneEffectReadVersion.V1)
          }
          instance.effects = [...instance.effects, ...array]
          break
        }
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
