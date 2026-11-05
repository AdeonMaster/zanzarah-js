import type { Float, UInt32 } from '../../types.ts'
import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { FColor } from '../FColor.ts'
import { Vector3 } from '../math/Vector3.ts'

export enum LightType {
  Directional = 1,
  Ambient = 2,
  Point = 128,
  Spot = 129,

  Unknown = -1,
}

export enum LightFlags {
  LightAtomics = 1 << 0,
  LightWorld = 1 << 1,
}

export class Light {
  idx: UInt32 = 0
  type: LightType = LightType.Unknown
  color: FColor = new FColor()
  flags: LightFlags = LightFlags.LightAtomics
  pos: Vector3 = new Vector3()
  vec: Vector3 = new Vector3()
  radius: Float = 0.0

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.idx)
    handler.writeInt32(this.type)
    this.color.write(handler)
    handler.writeUInt32(this.flags)
    switch (this.type) {
      case LightType.Directional:
        handler.writeVector3(this.pos)
        handler.writeVector3(this.vec)
        break
      case LightType.Point:
        handler.writeFloat(this.radius)
        handler.writeVector3(this.pos)
        break
      case LightType.Spot:
        handler.writeFloat(this.radius)
        handler.writeVector3(this.pos)
        handler.writeVector3(this.vec)
        break
    }
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.idx = handler.readUInt32()
    instance.type = handler.readInt32()
    instance.color = FColor.read(handler)
    instance.flags = handler.readUInt32()
    switch (instance.type) {
      case LightType.Directional:
        instance.pos = handler.readVector3()
        instance.vec = handler.readVector3()
        break
      case LightType.Point:
        instance.radius = handler.readFloat()
        instance.pos = handler.readVector3()
        break
      case LightType.Spot:
        instance.radius = handler.readFloat()
        instance.pos = handler.readVector3()
        instance.vec = handler.readVector3()
        break
    }

    return instance
  }
}
