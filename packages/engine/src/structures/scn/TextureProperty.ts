import type { Int32 } from '../../types.ts'
import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'

export class TextureProperty {
  fileName: string = ''
  footstepType: Int32 = 0

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
