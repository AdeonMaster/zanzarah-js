import type { BinaryReader } from "../../utils/BinaryReader.ts"
import type { BinaryWriter } from "../../utils/BinaryWriter.ts"
import { Row } from "./Row.ts"

export class Table {
  rows: Row[]

  constructor() {
    this.rows = []
  }

  write(handler: BinaryWriter) {
    handler.writeUInt32(this.rows.length)
    for(let i = 0; i < this.rows.length; ++i) {
      this.rows[i].write(handler)
    }
  }

  static read(handler: BinaryReader) {
    const rowCount = handler.readUInt32()
    const rows = new Array(rowCount)
    for(let i = 0; i < rowCount; ++i) {
      rows[i] = Row.read(handler)
    }

    const instance = new this()
    instance.rows = rows

    return instance
  }
}
