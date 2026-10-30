import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'

export class FColor {
  r: number
  g: number
  b: number
  a: number

  constructor() {
    this.r = 0.0
    this.g = 0.0
    this.b = 0.0
    this.a = 0.0
  }

  write(handler: ZBinaryWriter) {
    handler.writeFloat(this.r)
    handler.writeFloat(this.g)
    handler.writeFloat(this.b)
    handler.writeFloat(this.a)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()

    instance.r = handler.readFloat()
    instance.g = handler.readFloat()
    instance.b = handler.readFloat()
    instance.a = handler.readFloat()

    return instance
  }
}
