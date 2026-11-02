import type { BinaryReader } from '../utils/BinaryReader.ts'
import type { BinaryWriter } from '../utils/BinaryWriter.ts'

export class InventoryCard {
  cardId: number = 0
  atIndex: number = 0
  dbId: number = 0
  amount: number = 0
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
