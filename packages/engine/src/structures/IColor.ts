import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'

export class IColor {
  r: number = 255
  g: number = 255
  b: number = 255
  a: number = 255

  raw() {
    return (this.r << 0) | (this.g << 8) | (this.b << 16) | (this.a << 24)
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
