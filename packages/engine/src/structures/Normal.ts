import type { ZBinaryReader } from "../utils/ZBinaryReader.ts"
import type { ZBinaryWriter } from "../utils/ZBinaryWriter.ts"

export class Normal {
  x: number = 0
  y: number = 0
  z: number = 0
  p: number = 0

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
