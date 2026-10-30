import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'

export class BSP {
  constructor() {}

  write(handler: ZBinaryWriter) {}

  static read(handler: ZBinaryReader) {
    const sectionId = handler.readInt32()
    const size = handler.readUInt32()
    const version = handler.readUInt32()

    console.log(sectionId)
    console.log(size)
    console.log(version)

    const sectionName = handler.readZString()
    console.log(sectionName)

    const instance = new this()
    return instance
  }
}
