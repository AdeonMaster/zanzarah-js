import type { Int32, UInt32 } from '../types.ts'
import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'

export class Version {
  author: string = ''
  buildCountry: Int32 = 0
  buildType: Int32 = 0
  unk1: UInt32 = 0
  buildVersion: UInt32 = 0
  date: string = ''
  time: string = ''
  year: UInt32 = 0
  unk2: UInt32 = 0

  write(handler: ZBinaryWriter) {
    handler.writeZString(this.author)
    handler.writeInt32(this.buildCountry)
    handler.writeInt32(this.buildType)
    handler.writeUInt32(this.unk1)
    handler.writeUInt32(this.buildVersion)
    handler.writeZString(this.date)
    handler.writeZString(this.time)
    handler.writeUInt32(this.year)
    handler.writeUInt32(this.unk2)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.author = handler.readZString()
    instance.buildCountry = handler.readInt32()
    instance.buildType = handler.readInt32()
    instance.unk1 = handler.readUInt32()
    instance.buildVersion = handler.readUInt32()
    instance.date = handler.readZString()
    instance.time = handler.readZString()
    instance.year = handler.readUInt32()
    instance.unk2 = handler.readUInt32()

    return instance
  }
}
