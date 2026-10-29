import type { ZBinaryReader } from "../../utils/ZBinaryReader.ts";
import type { ZBinaryWriter } from "../../utils/ZBinaryWriter.ts";

export class Cell {
  type: number
  columnIndex: number
  value: any

  constructor() {
    this.type = 0
    this.columnIndex = 0
    this.value = null
  }

  write(handler: ZBinaryWriter) {
    handler.writeInt32(this.type)
    handler.writeInt32(this.columnIndex)
    switch(this.type) {
      case 0:
        handler.writeZString(this.value)
        break
      case 1:
        handler.writeUInt32(4)
        handler.writeInt32(this.value)
        break
      case 3:
        handler.writeUInt32(8)
        handler.writeUInt32(this.value[0])
        handler.writeUInt32(this.value[1])
        break
      case 4:
        handler.writeUInt32(1)
        handler.writeBytes(Buffer.from([this.value]))
        break
      case 5:
        handler.writeUInt32(this.value.length)
        handler.writeBytes(this.value)
        break
      default:
        throw new Error(`Cell.write: Unknown cell data type ${this.type}`)
    }
  }

  static read(handler: ZBinaryReader) {
    const type = handler.readInt32()
    const columnIndex = handler.readInt32()
    let value = null

    switch(type) {
      case 0: {//string
        value = handler.readZString()
        break
      }
      case 1: {//integer
        const size = handler.readUInt32()
        value = handler.readInt32()
        break
      }
      // case 2: {//unknown
      //   break
      // }
      case 3: {//fkey
        const size = handler.readUInt32()
        const uid = handler.readUInt32()
        const type = handler.readUInt32()
        value = [uid, type]
        break
      }
      case 4: {//byte
        const size = handler.readUInt32()
        value = handler.readBytes(1)[0]
        break
      }
      case 5: {//buffer
        const size = handler.readUInt32()
        value = handler.readBytes(size)
        break
      }
      default:
        throw new Error(`Cell.read: Unknown cell data type ${type}`)
    }

    const instance = new this()
    instance.type = type
    instance.columnIndex = columnIndex
    instance.value = value

    return instance
  }
}
