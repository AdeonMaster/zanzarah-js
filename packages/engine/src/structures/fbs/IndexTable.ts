import type { UInt32 } from '../../types.ts'
import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'

export class IndexTable {
  numbers: UInt32[] = []
  names: string[] = []

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.names.length)
    for (let i = 0; i < this.names.length; ++i) {
      handler.writeUInt32(this.numbers[i])
      handler.writeZString(this.names[i])
    }
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()

    const columnsCount = handler.readUInt32()
    instance.numbers = new Array(columnsCount)
    instance.names = new Array(columnsCount)
    for (let i = 0; i < columnsCount; ++i) {
      instance.numbers[i] = handler.readUInt32()
      instance.names[i] = handler.readZString()
    }

    return instance
  }
}
