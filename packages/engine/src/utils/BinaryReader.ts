import fs from 'node:fs'
import type { Byte, Float, Int16, Int32, Int8, UInt16, UInt32, UInt8 } from '../types.ts'

export class BinaryReader {
  private offset = 0
  public readonly length: number

  constructor(private readonly source: number | Buffer) {
    this.length =
      typeof source === 'number'
        ? fs.fstatSync(source).size
        : source.length
  }

  seek(offset: number) {
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > this.length) {
      throw new RangeError(`Invalid seek offset: ${offset}`)
    }
  
    this.offset = offset
  }

  pos() {
    return this.offset
  }

  readBytes(length: number): Buffer {
    if (!Number.isSafeInteger(length) || length < 0) {
      throw new RangeError(`Invalid byte length: ${length}`)
    }

    if (length > this.length - this.offset) {
      throw new Error(
        `Cannot read ${length} bytes at offset ${this.offset}; source length is ${this.length}`,
      )
    }

    const buffer = Buffer.allocUnsafe(length)

    if (typeof this.source !== 'number') {
      this.source.copy(buffer, 0, this.offset, this.offset + length)
      this.offset += length
      return buffer
    }

    let totalRead = 0

    while (totalRead < length) {
      const bytesRead = fs.readSync(
        this.source,
        buffer,
        totalRead,
        length - totalRead,
        this.offset,
      )

      if (bytesRead === 0) {
        throw new Error(`Unexpected end of file at offset ${this.offset}`)
      }

      totalRead += bytesRead
      this.offset += bytesRead
    }

    return buffer
  }

  readByte() {
    return this.readBytes(1)[0] as Byte
  }

  readUInt8() {
    return this.readByte() as UInt8
  }

  readInt8() {
    return this.readBytes(1).readInt8(0) as Int8
  }

  readUInt16() {
    return this.readBytes(2).readUInt16LE(0) as UInt16
  }

  readInt16() {
    return this.readBytes(2).readInt16LE(0) as Int16
  }

  readInt32() {
    return this.readBytes(4).readInt32LE(0) as Int32
  }

  readUInt32() {
    return this.readBytes(4).readUInt32LE(0) as UInt32
  }

  readBool() {
    return this.readByte() !== 0
  }

  readFloat() {
    return this.readBytes(4).readFloatLE(0) as Float
  }

  readString(length: number, encoding: BufferEncoding = 'ascii') {
    return this.readBytes(length).toString(encoding)
  }
}
