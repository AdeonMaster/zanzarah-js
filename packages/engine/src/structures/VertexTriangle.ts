import type { UInt16 } from '../types.ts'
import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'

export class VertexTriangle {
  m: UInt16 = 0
  v1: UInt16 = 0
  v2: UInt16 = 0
  v3: UInt16 = 0

  write(handler: ZBinaryWriter) {
    handler.writeUInt16(this.m)
    handler.writeUInt16(this.v1)
    handler.writeUInt16(this.v2)
    handler.writeUInt16(this.v3)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.m = handler.readUInt16()
    instance.v1 = handler.readUInt16()
    instance.v2 = handler.readUInt16()
    instance.v3 = handler.readUInt16()

    return instance
  }
}
