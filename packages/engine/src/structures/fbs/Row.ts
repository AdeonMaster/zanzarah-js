import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'
import { Cell } from './Cell.ts'

export class Row {
  uid: number = 0
  cells: Cell[] = []

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.uid)
    handler.writeUInt32(this.cells.length)
    for (let i = 0; i < this.cells.length; ++i) {
      this.cells[i].write(handler)
    }
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.uid = handler.readUInt32()
    const cellsCount = handler.readUInt32()
    instance.cells = new Array(cellsCount)
    for (let i = 0; i < cellsCount; ++i) {
      instance.cells[i] = Cell.read(handler)
    }

    return instance
  }
}
