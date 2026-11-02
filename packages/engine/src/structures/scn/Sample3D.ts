import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { Vector3 } from '../math/Vector3.ts'

export class Sample3D {
  idx: number = 0
  filename: string = ''
  pos: Vector3 = new Vector3()
  forward: Vector3 = new Vector3()
  up: Vector3 = new Vector3()
  minDist: number = 0.0
  maxDist: number = 0.0
  volume: number = 0
  loopCount: number = 0
  falloff: number = 0

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.idx)
    handler.writeZString(this.filename)
    handler.writeVector3(this.pos)
    handler.writeVector3(this.forward)
    handler.writeVector3(this.up)
    handler.writeFloat(this.minDist)
    handler.writeFloat(this.maxDist)
    handler.writeUInt32(this.volume)
    handler.writeUInt32(this.loopCount)
    handler.writeUInt32(this.falloff)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.idx = handler.readUInt32()
    instance.filename = handler.readZString()
    instance.pos = handler.readVector3()
    instance.forward = handler.readVector3()
    instance.up = handler.readVector3()
    instance.minDist = handler.readFloat()
    instance.maxDist = handler.readFloat()
    instance.volume = handler.readUInt32()
    instance.loopCount = handler.readUInt32()
    instance.falloff = handler.readUInt32()

    return instance
  }
}
