import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { Version } from '../Version.ts'
import { DynModel } from './DynModel.ts'
import { FOModel } from './FOModel.ts'
import { Light } from './Light.ts'
import { Misc } from './Misc.ts'
import { Model } from './Model.ts'

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

  constructor() {
    this.version = new Version()
    this.misc = new Misc()
    this.lights = []
    this.foModels = []
    this.models = []
    this.dynModels = []
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
