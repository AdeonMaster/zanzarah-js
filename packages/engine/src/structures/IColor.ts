import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'

export class IColor {
  r: number
  g: number
  b: number
  a: number

  constructor() {
    this.r = 255
    this.g = 255
    this.b = 255
    this.a = 255
  }

  write(handler: ZBinaryWriter) {
    handler.writeUInt8(this.r)
    handler.writeUInt8(this.g)
    handler.writeUInt8(this.b)
    handler.writeUInt8(this.a)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()

    instance.r = handler.readUInt8()
    instance.g = handler.readUInt8()
    instance.b = handler.readUInt8()
    instance.a = handler.readUInt8()

    return instance
  }
}
