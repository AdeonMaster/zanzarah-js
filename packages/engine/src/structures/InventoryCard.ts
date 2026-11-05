import type { UInt32 } from '../types.ts'
import type { BinaryReader } from '../utils/BinaryReader.ts'
import type { BinaryWriter } from '../utils/BinaryWriter.ts'

export class InventoryCard {
  cardId: UInt32 = 0
  atIndex: UInt32 = 0
  dbId: UInt32 = 0
  amount: UInt32 = 0
  isInUse: boolean = false

  write(handler: BinaryWriter) {
    handler.writeUInt32(this.cardId)
    handler.writeUInt32(this.atIndex)
    handler.writeUInt32(this.dbId)
    handler.writeUInt32(this.amount)
    handler.writeBool(this.isInUse)
  }

  static read(handler: BinaryReader) {
    const instance = new this()
    instance.cardId = handler.readUInt32()
    instance.atIndex = handler.readUInt32()
    instance.dbId = handler.readUInt32()
    instance.amount = handler.readUInt32()
    instance.isInUse = handler.readBool()

    return instance
  }
}
