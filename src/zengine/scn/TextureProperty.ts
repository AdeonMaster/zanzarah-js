import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'

export class TextureProperty {
  fileName: string
  footstepType: number

  constructor() {
    this.fileName = ''
    this.footstepType = 0
  }

  write(handler: ZBinaryWriter) {
    handler.writeZString(this.fileName)
    handler.writeInt32(this.footstepType)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()

    instance.fileName = handler.readZString()
    instance.footstepType = handler.readInt32()

    return instance
  }
}
