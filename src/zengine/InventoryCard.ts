import type { BinaryReader } from '../utils/BinaryReader.ts'
import type { BinaryWriter } from '../utils/BinaryWriter.ts'

export class InventoryCard {
  cardId: number
  atIndex: number
  dbId: number
  amount: number
  isInUse: boolean

  constructor(
    cardId: number,
    atIndex: number,
    dbId: number,
    amount: number,
    isInUse: boolean,
  ) {
    this.cardId = cardId
    this.atIndex = atIndex
    this.dbId = dbId
    this.amount = amount
    this.isInUse = isInUse
  }

  write(handler: BinaryWriter) {
    handler.writeUInt32(this.cardId)
    handler.writeUInt32(this.atIndex)
    handler.writeUInt32(this.dbId)
    handler.writeUInt32(this.amount)
    handler.writeBool(this.isInUse)
  }

  static read(handler: BinaryReader) {
    const cardId = handler.readUInt32()
    const atIndex = handler.readUInt32()
    const dbId = handler.readUInt32()
    const amount = handler.readUInt32()
    const isInUse = handler.readBool()

    return new this(cardId, atIndex, dbId, amount, isInUse)
  }
}
