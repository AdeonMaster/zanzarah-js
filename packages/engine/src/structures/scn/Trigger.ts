import type { Float, Int32, UInt32 } from '../../types.ts'
import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { Vector3 } from '../math/Vector3.ts'

export enum TriggerColliderType {
  Box = 0,
  Sphere = 1,
  Point = 2,

  Unknown = -1,
}

export class Trigger {
  idx: UInt32 = 0
  requiresLooking: boolean = false
  colliderType: TriggerColliderType = TriggerColliderType.Unknown
  dir: Vector3 = new Vector3()
  type: Int32 = 0
  ii1: UInt32 = 0
  ii2: UInt32 = 0
  ii3: UInt32 = 0
  ii4: UInt32 = 0
  s: string = ''
  pos: Vector3 = new Vector3()
  end: Vector3 = new Vector3()
  radius: Float = 0.0

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.idx)
    handler.writeInt32(this.colliderType)
    handler.writeUInt32(this.requiresLooking ? 1 : 0)
    handler.writeVector3(this.dir)
    handler.writeInt32(this.type)
    handler.writeUInt32(this.ii1)
    handler.writeUInt32(this.ii2)
    handler.writeUInt32(this.ii3)
    handler.writeUInt32(this.ii4)
    handler.writeZString(this.s)
    handler.writeVector3(this.pos)
    switch (this.colliderType) {
      case TriggerColliderType.Box:
        handler.writeVector3(this.end)
        break
      case TriggerColliderType.Sphere:
        handler.writeFloat(this.radius)
        break
    }
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.idx = handler.readUInt32()
    instance.colliderType = handler.readInt32()
    instance.requiresLooking = handler.readUInt32() !== 0
    instance.dir = handler.readVector3()
    instance.type = handler.readInt32()
    instance.ii1 = handler.readUInt32()
    instance.ii2 = handler.readUInt32()
    instance.ii3 = handler.readUInt32()
    instance.ii4 = handler.readUInt32()
    instance.s = handler.readZString()
    instance.pos = handler.readVector3()
    instance.end = new Vector3()
    instance.radius = 0.0
    switch (instance.colliderType) {
      case TriggerColliderType.Box:
        instance.end = handler.readVector3()
        break
      case TriggerColliderType.Sphere:
        instance.radius = handler.readFloat()
        break
      case TriggerColliderType.Point:
        break
      default:
        throw new Error('Trigger.read: Invalid trigger type')
    }

    return instance
  }
}
