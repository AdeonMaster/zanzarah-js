import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'

export enum SceneType {
  Overworld = 0,
  Arena = 1,
  MultiplayerArena = 2,

  Unknown = -1,
}

export class Dataset {
  sceneId: number
  sceneType: number
  nameUID: number
  unk1: number
  isInterior: boolean
  canChangeDeck: boolean
  unk4: number
  isHotScene: boolean
  unk6: boolean
  s1: string
  s2: string

  constructor() {
    this.sceneId = 0
    this.sceneType = 0
    this.nameUID = 0
    this.unk1 = 0
    this.isInterior = false
    this.canChangeDeck = false
    this.unk4 = 0
    this.isHotScene = false
    this.unk6 = false
    this.s1 = ''
    this.s2 = ''
  }

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(0x24)
    handler.writeUInt32(this.sceneId)
    handler.writeInt32(this.sceneType)
    handler.writeUInt32(this.nameUID)
    handler.writeUInt16(this.unk1)
    handler.writeUInt16(0) // padding
    handler.writeUInt32(this.isInterior ? 1 : 0)
    handler.writeUInt8(this.canChangeDeck ? 1 : 0)
    handler.writeBytes(Buffer.from([0, 0, 0]))
    handler.writeUInt32(this.isHotScene ? 1 : 0)
    handler.writeUInt32(this.unk6 ? 1 : 0)
    handler.writeZString(this.s1)
    handler.writeZString(this.s2)
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()

    const dataSize = handler.readUInt32()
    if (dataSize !== 0x20 && dataSize !== 0x24)
      throw new Error('Dataset.read: Unknown size for dataset structure')

    instance.sceneId = handler.readUInt32()
    instance.sceneType = handler.readInt32()
    instance.nameUID = handler.readUInt32()
    instance.unk1 = handler.readUInt16()
    handler.readUInt16() // padding
    instance.isInterior = handler.readUInt32() !== 0
    instance.canChangeDeck = handler.readUInt8() !== 0
    handler.readBytes(3) // padding
    instance.unk4 = handler.readUInt32()
    instance.isHotScene = handler.readUInt32() !== 0
    instance.unk6 = dataSize > 0x20 ? handler.readUInt32() !== 0 : false
    instance.s1 = handler.readZString()
    instance.s2 = handler.readZString()

    return instance
  }
}
