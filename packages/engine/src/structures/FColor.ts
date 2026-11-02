import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'
import { IColor } from './IColor.ts'

export class FColor {
  r: number = 0.0
  g: number = 0.0
  b: number = 0.0
  a: number = 0.0

  toIColor() {
    const instance = new IColor()
    instance.r = Math.round(this.r * 255)
    instance.g = Math.round(this.g * 255)
    instance.b = Math.round(this.b * 255)
    instance.a = Math.round(this.a * 255)

    return instance
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
