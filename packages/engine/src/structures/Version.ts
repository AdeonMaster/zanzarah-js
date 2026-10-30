import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'

export class Version {
  author: string
  buildCountry: number
  buildType: number
  unk1: number
  buildVersion: number
  date: string
  time: string
  year: number
  unk2: number

  constructor() {
    this.author = ''
    this.buildCountry = 0
    this.buildType = 0
    this.unk1 = 0
    this.buildVersion = 0
    this.date = ''
    this.time = ''
    this.year = 0
    this.unk2 = 0
  }

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
    const author = handler.readZString()
    const buildCountry = handler.readInt32()
    const buildType = handler.readInt32()
    const unk1 = handler.readUInt32()
    const buildVersion = handler.readUInt32()
    const date = handler.readZString()
    const time = handler.readZString()
    const year = handler.readUInt32()
    const unk2 = handler.readUInt32()

    const instance = new this()
    instance.author = author
    instance.buildCountry = buildCountry
    instance.buildType = buildType
    instance.unk1 = unk1
    instance.buildVersion = buildVersion
    instance.date = date
    instance.time = time
    instance.year = year
    instance.unk2 = unk2

    return instance
  }
}
