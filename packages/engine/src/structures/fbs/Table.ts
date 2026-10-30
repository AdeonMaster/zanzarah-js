import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { Row } from './Row.ts'

export class Table {
  rows: Row[]

  constructor() {
    this.rows = []
  }

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.rows.length)
    for (let i = 0; i < this.rows.length; ++i) {
      this.rows[i].write(handler)
    }
  }

  static read(handler: ZBinaryReader) {
    const rowCount = handler.readUInt32()
    const rows = new Array(rowCount)
    for (let i = 0; i < rowCount; ++i) {
      rows[i] = Row.read(handler)
    }

    const instance = new this()
    instance.rows = rows

    return instance
  }
}
