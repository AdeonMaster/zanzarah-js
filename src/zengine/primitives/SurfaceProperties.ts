import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'

export class SurfaceProperties {
  ambient: number
  specular: number
  diffuse: number

  constructor() {
    this.ambient = 0.0
    this.specular = 0.0
    this.diffuse = 0.0
  }

  write(handler: ZBinaryWriter) {
    handler.writeFloat(this.ambient)
    handler.writeFloat(this.specular)
    handler.writeFloat(this.diffuse)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()

    instance.ambient = handler.readFloat()
    instance.specular = handler.readFloat()
    instance.diffuse = handler.readFloat()

    return instance
  }
}
