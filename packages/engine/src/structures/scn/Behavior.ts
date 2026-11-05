import type { Int32, UInt32 } from '../../types.ts'
import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'

export class Behavior {
  type: Int32 = 0
  modelId: UInt32 = 0

  write(handler: ZBinaryWriter) {
    handler.writeInt32(this.type)
    handler.writeUInt32(this.modelId)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.type = handler.readInt32()
    instance.modelId = handler.readUInt32()

    return instance
  }
}
