import type { ZBinaryReader } from '../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../utils/ZBinaryWriter.ts'

export class IndexTable {
  numbers: number[]
  names: string[]

  constructor() {
    this.numbers = []
    this.names = []
  }

  write(handler: ZBinaryWriter) {
    handler.writeUInt32(this.names.length)
    for (let i = 0; i < this.names.length; ++i) {
      handler.writeUInt32(this.numbers[i])
      handler.writeZString(this.names[i])
    }
  }

  static read(handler: ZBinaryReader) {
    const columnsCount = handler.readUInt32()
    const numbers = new Array(columnsCount)
    const names = new Array(columnsCount)

    for (let i = 0; i < columnsCount; ++i) {
      const number = handler.readUInt32()
      const name = handler.readZString()

      numbers[i] = number
      names[i] = name
    }

    const instance = new this()
    instance.names = names
    instance.numbers = numbers

    return instance
  }
}
