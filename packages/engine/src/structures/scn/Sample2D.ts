import type { UInt32, UInt8 } from '../../types.ts'
import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'

export class Sample2D {
  idx: UInt32 = 0
  filename: string = ''
  volume: UInt32 = 0
  loopCount: UInt32 = 0
  c: UInt8 = 0

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.idx)
    handler.writeZString(this.filename)
    handler.writeUInt32(this.volume)
    handler.writeUInt32(this.loopCount)
    handler.writeUInt8(this.c)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.idx = handler.readUInt32()
    instance.filename = handler.readZString()
    instance.volume = handler.readUInt32()
    instance.loopCount = handler.readUInt32()
    instance.c = handler.readUInt8()

    return instance
  }
}
