import type { Float, Int16, Int32, Int8, UInt16, UInt32, UInt8 } from "../types.ts"

export class BinaryReader {
  private buffer: Buffer
  private offset: number
  public length: number

  constructor(buffer: Buffer) {
    this.buffer = buffer
    this.offset = 0
    this.length = buffer.length
  }

  seek(offset: number) {
    this.offset = offset
  }

  pos() {
    return this.offset
  }

  readUInt8() {
    const v = this.buffer.readUInt8(this.offset) as UInt8
    this.offset += 1
    return v
  }

  readInt8() {
    const v = this.buffer.readInt8(this.offset) as Int8
    this.offset += 1
    return v
  }

  readUInt16() {
    const v = this.buffer.readUInt16LE(this.offset) as UInt16
    this.offset += 2
    return v
  }

  readInt16() {
    const v = this.buffer.readInt16LE(this.offset) as Int16
    this.offset += 2
    return v
  }

  readUInt32() {
    const v = this.buffer.readUInt32LE(this.offset) as UInt32
    this.offset += 4
    return v
  }

  readInt32() {
    const v = this.buffer.readInt32LE(this.offset) as Int32
    this.offset += 4
    return v
  }

  readBytes(count: number) {
    if (
      !Number.isInteger(count) ||
      count < 0 ||
      this.offset + count > this.buffer.length
    ) {
      throw new RangeError('Unexpected end of buffer')
    }

    const b = this.buffer.subarray(this.offset, this.offset + count)
    this.offset += count
    return b
  }

  readBool() {
    return this.readUInt8() !== 0
  }

  readString(length: number) {
    return this.readBytes(length).toString('ascii')
  }

  readFloat() {
    const v = this.buffer.readFloatLE(this.offset) as Float
    this.offset += 4
    return v
  }
}
