import type { Int8, UInt8 } from "../types.ts"
import type { ZBinaryReader } from "../utils/ZBinaryReader.ts"
import type { ZBinaryWriter } from "../utils/ZBinaryWriter.ts"

export class Normal {
  x: UInt8 = 0
  y: UInt8 = 0
  z: UInt8 = 0
  p: Int8 = 0

  write(handler: ZBinaryWriter) {
    handler.writeUInt8(this.x)
    handler.writeUInt8(this.y)
    handler.writeUInt8(this.z)
    handler.writeInt8(this.p)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.x = handler.readUInt8()
    instance.y = handler.readUInt8()
    instance.z = handler.readUInt8()
    instance.p = handler.readInt8()

    return instance
  }
}
