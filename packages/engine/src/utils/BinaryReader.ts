export class BinaryReader {
  private buffer: Buffer
  private offset: number

  constructor(buffer: Buffer) {
    this.buffer = buffer
    this.offset = 0
  }

  seek(offset: number) {
    this.offset = offset
  }

  pos() {
    return this.offset
  }

  readUInt8() {
    const v = this.buffer.readUInt8(this.offset)
    this.offset += 1
    return v
  }

  readInt8() {
    const v = this.buffer.readInt8(this.offset)
    this.offset += 1
    return v
  }

  readUInt16() {
    const v = this.buffer.readUInt16LE(this.offset)
    this.offset += 2
    return v
  }

  readInt16() {
    const v = this.buffer.readInt16LE(this.offset)
    this.offset += 2
    return v
  }

  readUInt32() {
    const v = this.buffer.readUInt32LE(this.offset)
    this.offset += 4
    return v
  }

  readInt32() {
    const v = this.buffer.readInt32LE(this.offset)
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
    const b = this.buffer.subarray(this.offset, this.offset + 1)
    this.offset += 1

    return !!b[0]
  }

  readString(length: number) {
    return this.readBytes(length).toString('ascii')
  }

  readFloat() {
    const v = this.buffer.readFloatLE(this.offset)
    this.offset += 4
    return v
  }
}
