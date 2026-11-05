import type { UInt32 } from '../../types.ts'
import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'

export class SceneItem {
  name: string = ''
  index: UInt32 = 0
  type: UInt32 = 0

  write(handler: ZBinaryWriter) {
    handler.writeZString(this.name)
    handler.writeUInt32(this.index)
    handler.writeUInt32(this.type)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.name = handler.readZString()
    instance.index = handler.readUInt32()
    instance.type = handler.readUInt32()

    return instance
  }
}
