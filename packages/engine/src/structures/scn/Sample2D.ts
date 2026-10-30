import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'

export class Sample2D {
  idx: number
  filename: string
  volume: number
  loopCount: number
  c: number

  constructor() {
    this.idx = 0
    this.filename = ''
    this.volume = 0
    this.loopCount = 0
    this.c = 0
  }

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
