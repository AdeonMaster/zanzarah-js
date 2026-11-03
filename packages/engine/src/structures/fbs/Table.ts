import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { Row } from './Row.ts'

export class Table {
  rows: Row[] = []

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.rows.length)
    for (let i = 0; i < this.rows.length; ++i) {
      this.rows[i].write(handler)
    }
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    const rowCount = handler.readUInt32()
    instance.rows = new Array(rowCount)
    for (let i = 0; i < rowCount; ++i) {
      instance.rows[i] = Row.read(handler)
    }

    return instance
  }
}
