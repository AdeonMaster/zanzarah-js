import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { Vector3 } from '../math/Vector3.ts'

export class Sample3D {
  idx: number
  filename: string
  pos: Vector3
  forward: Vector3
  up: Vector3
  minDist: number
  maxDist: number
  volume: number
  loopCount: number
  falloff: number

  constructor() {
    this.idx = 0
    this.filename = ''
    this.pos = new Vector3()
    this.forward = new Vector3()
    this.up = new Vector3()
    this.minDist = 0.0
    this.maxDist = 0.0
    this.volume = 0
    this.loopCount = 0
    this.falloff = 0
  }

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
