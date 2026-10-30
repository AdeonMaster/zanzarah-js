export class BinaryWriter {
  private chunks: Buffer[]
  private length: number

  constructor() {
    this.chunks = []
    this.length = 0
  }

  writeUInt8(v: number) {
    const b = Buffer.allocUnsafe(1)
    b.writeUInt8(v >>> 0)
    this.chunks.push(b)
    this.length += 1
  }

  writeInt8(v: number) {
    const b = Buffer.allocUnsafe(1)
    b.writeUInt8(v | 0)
    this.chunks.push(b)
    this.length += 1
  }

  writeUInt16(v: number) {
    const b = Buffer.allocUnsafe(2)
    b.writeUInt16LE(v >>> 0)
    this.chunks.push(b)
    this.length += 2
  }

  writeInt16(v: number) {
    const b = Buffer.allocUnsafe(2)
    b.writeUInt16LE(v | 0)
    this.chunks.push(b)
    this.length += 2
  }

  writeUInt32(v: number) {
    const b = Buffer.allocUnsafe(4)
    b.writeUInt32LE(v >>> 0)
    this.chunks.push(b)
    this.length += 4
  }

  writeInt32(v: number) {
    const b = Buffer.allocUnsafe(4)
    b.writeInt32LE(v | 0)
    this.chunks.push(b)
    this.length += 4
  }

  writeString(str: string, len: number, pad = '\0') {
    const b = Buffer.alloc(len, pad.charCodeAt(0))
    b.write(str, 'ascii')
    this.chunks.push(b)
    this.length += len
  }

  writeBytes(buf: Buffer) {
    this.chunks.push(buf)
    this.length += buf.length
  }

  writeBool(bool: boolean) {
    this.chunks.push(Buffer.from([Number(bool)]))
    this.length += 1
  }

  writeFloat(v: number) {
    const b = Buffer.allocUnsafe(4)
    b.writeFloatLE(v)
    this.chunks.push(b)
    this.length += 4
  }

  toBuffer() {
    return Buffer.concat(this.chunks, this.length)
  }
}
