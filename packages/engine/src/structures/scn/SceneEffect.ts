import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { Vector3 } from '../math/Vector3.ts'

export enum SceneEffectType {
  Leaves = 1,
  Unused4 = 4,
  Unused5 = 5,
  Unknown6 = 6,
  Unused7 = 7,
  Unknown10 = 10,
  Snowflakes = 11,
  Combiner = 13,

  Unknown = -1,
}

export enum SceneEffectReadVersion {
  V1,
  V2,
}

export enum SceneEffectOrder {
  Early,
  Solid,
  Late,
}

export class SceneEffect {
  readVersion: SceneEffectReadVersion

  idx: number
  type: SceneEffectType
  pos: Vector3
  end: Vector3
  dir: Vector3
  up: Vector3
  param: number
  effectFile: string
  order: SceneEffectOrder

  constructor(readVersion: SceneEffectReadVersion) {
    this.readVersion = readVersion

    this.idx = 0
    this.type = SceneEffectType.Leaves
    this.pos = new Vector3()
    this.end = new Vector3()
    this.dir = new Vector3()
    this.up = new Vector3()
    this.param = 0
    this.effectFile = ''
    this.order = SceneEffectOrder.Late
  }

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.idx)
    handler.writeInt32(this.type)
    if (this.readVersion === SceneEffectReadVersion.V2) {
      handler.writeInt32(this.order)
      handler.writeBytes(Buffer.from(Array(16).fill(0)))
    }
    switch (this.type) {
      case SceneEffectType.Leaves:
      case SceneEffectType.Unused5:
      case SceneEffectType.Unknown6:
      case SceneEffectType.Unknown10:
        handler.writeUInt32(this.param)
        handler.writeVector3(this.pos)
        handler.writeVector3(this.end)
        break
      case SceneEffectType.Snowflakes:
        handler.writeUInt32(this.param)
        break
      case SceneEffectType.Combiner:
        handler.writeZString(this.effectFile)
        handler.writeVector3(this.up)
        handler.writeVector3(this.dir)
        handler.writeVector3(this.pos)
        handler.writeUInt32(this.param)
        break
      case SceneEffectType.Unused4:
        handler.writeUInt32(this.param)
        handler.writeVector3(this.pos)
        break
      case SceneEffectType.Unused7:
        handler.writeZString(this.effectFile)
        handler.writeVector3(this.pos)
        break
    }
  }

  static read(handler: ZBinaryReader, readVersion: SceneEffectReadVersion) {
    const instance = new this(readVersion)

    instance.idx = handler.readUInt32()
    instance.type = handler.readInt32()
    if (readVersion === SceneEffectReadVersion.V2) {
      instance.order = handler.readInt32()
      handler.seek(handler.pos() + 16)
    }

    switch (instance.type) {
      case SceneEffectType.Leaves:
      case SceneEffectType.Unused5:
      case SceneEffectType.Unknown6:
      case SceneEffectType.Unknown10:
        instance.param = handler.readUInt32()
        instance.pos = handler.readVector3()
        instance.end = handler.readVector3()
        break
      case SceneEffectType.Snowflakes:
        instance.param = handler.readUInt32()
        break
      case SceneEffectType.Combiner:
        instance.effectFile = handler.readZString()
        instance.up = handler.readVector3()
        instance.dir = handler.readVector3()
        instance.pos = handler.readVector3()
        instance.param = handler.readUInt32()
        break
      case SceneEffectType.Unused4:
        instance.param = handler.readUInt32()
        instance.pos = handler.readVector3()
        break
      case SceneEffectType.Unused7:
        instance.effectFile = handler.readZString()
        instance.pos = handler.readVector3()
        break
      default:
        throw new Error('SceneEffect.read: Invalid scene effect type')
    }

    return instance
  }
}
