import fs from 'node:fs'
import type { Byte, Float, Int16, Int32, Int8, UInt16, UInt32, UInt8 } from '../types.ts'

export class BinaryWriter {
  private offset = 0
  public length: number

  constructor(private source: number | Buffer) {
    this.length =
      typeof source === 'number'
        ? fs.fstatSync(source).size
        : source.length
  }

  seek(offset: number) {
    if (!Number.isSafeInteger(offset) || offset < 0) {
      throw new RangeError(`Invalid seek offset: ${offset}`)
    }

    this.offset = offset
  }

  pos() {
    return this.offset
  }

  writeBytes(bytes: Buffer) {
    if (bytes.length === 0) {
      return
    }

    const end = this.offset + bytes.length

    if (!Number.isSafeInteger(end)) {
      throw new RangeError(`Invalid write end offset: ${end}`)
    }

    if (typeof this.source !== 'number') {
      if (end > this.source.length) {
        // Grow geometrically to avoid reallocating for every small write.
        const capacity = Math.max(end, this.source.length * 2, 1024)

        // Zero-filled allocation also handles seeking beyond the current end.
        const buffer = Buffer.alloc(capacity)
        this.source.copy(buffer, 0, 0, this.length)
        this.source = buffer
      }

      bytes.copy(this.source, this.offset)
      this.offset = end
      this.length = Math.max(this.length, end)
      return
    }

    let totalWritten = 0

    while (totalWritten < bytes.length) {
      const bytesWritten = fs.writeSync(
        this.source,
        bytes,
        totalWritten,
        bytes.length - totalWritten,
        this.offset,
      )

      if (bytesWritten === 0) {
        throw new Error(`Could not write at offset ${this.offset}`)
      }

      totalWritten += bytesWritten
      this.offset += bytesWritten
      this.length = Math.max(this.length, this.offset)
    }
  }

  writeByte(value: Byte) {
    this.writeUInt8(value)
  }

  writeUInt8(value: UInt8) {
    const buffer = Buffer.allocUnsafe(1)
    buffer.writeUInt8(value)
    this.writeBytes(buffer)
  }

  writeInt8(value: Int8) {
    const buffer = Buffer.allocUnsafe(1)
    buffer.writeInt8(value)
    this.writeBytes(buffer)
  }

  writeUInt16(value: UInt16) {
    const buffer = Buffer.allocUnsafe(2)
    buffer.writeUInt16LE(value)
    this.writeBytes(buffer)
  }

  writeInt16(value: Int16) {
    const buffer = Buffer.allocUnsafe(2)
    buffer.writeInt16LE(value)
    this.writeBytes(buffer)
  }

  writeInt32(value: Int32) {
    const buffer = Buffer.allocUnsafe(4)
    buffer.writeInt32LE(value)
    this.writeBytes(buffer)
  }

  writeUInt32(value: UInt32) {
    const buffer = Buffer.allocUnsafe(4)
    buffer.writeUInt32LE(value)
    this.writeBytes(buffer)
  }

  writeBool(value: boolean) {
    this.writeUInt8(value ? 1 : 0)
  }

  writeFloat(value: Float) {
    const buffer = Buffer.allocUnsafe(4)
    buffer.writeFloatLE(value)
    this.writeBytes(buffer)
  }

  writeString(value: string, encoding: BufferEncoding = 'ascii') {
    this.writeBytes(Buffer.from(value, encoding))
  }
}
