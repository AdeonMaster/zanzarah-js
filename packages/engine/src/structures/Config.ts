import type { Float, UInt8 } from '../types.ts'
import type { ZBinaryReader } from '../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../utils/ZBinaryWriter.ts'

export class ConfigValue {
  float: Float = 0
  string: string = ''

  constructor(float: Float, string: string) {
    this.float = float
    this.string = string
  }

  value() {
    return this.string.length > 0 ? this.string : this.float
  }

  write(handler: ZBinaryWriter) {
    handler.writeFloat(this.float)
    handler.writeUInt8(this.string.length > 0 ? 1 : 0)
    if (this.string.length > 0)
      Config.writeEncryptedString(handler, this.string)
    handler.writeUInt8(1)
  }

  static read(handler: ZBinaryReader) {
    const floatValue = handler.readFloat()
    const isStringValue = handler.readUInt8() !== 0
    const stringValue = isStringValue ? Config.readEncryptedString(handler) : ''
    handler.readUInt8() //ignored byte in the end

    return isStringValue ? new this(0.0, stringValue) : new this(floatValue, '')
  }
}

export class Config {
  expectedChecksum: Buffer = Buffer.alloc(0)
  header: Buffer = Buffer.alloc(0)
  firstValue: ConfigValue = new ConfigValue(0.0, '')
  variables: Map<string, ConfigValue> = new Map<string, ConfigValue>()

  static XOR_KEY = 0x75

  static writeEncryptedString(handler: ZBinaryWriter, str: string) {
    if (str.length > 255)
      throw new Error(
        'Config.writeEncrypredString: String is too long for Config',
      )

    handler.writeUInt8(str.length as UInt8)
    handler.writeBytes(
      Buffer.from(Buffer.from(str).map((byte) => byte ^ Config.XOR_KEY)),
    )
    handler.writeUInt8(0)
  }

  static readEncryptedString(handler: ZBinaryReader) {
    const len = handler.readUInt8()
    const buffer = handler.readBytes(len)
    handler.readUInt8() //ignored terminator byte

    return Buffer.from(buffer.map((byte) => byte ^ Config.XOR_KEY)).toString(
      'ascii',
    )
  }

  write(handler: ZBinaryWriter) {
    throw new Error('Config.write: Not implemented yet')
  }

  static read(handler: ZBinaryReader) {
    const instance = new this()
    instance.expectedChecksum = handler.readBytes(16)
    instance.header = handler.readBytes(3)
    instance.firstValue = ConfigValue.read(handler)

    while (handler.pos() < handler.length) {
      const name = this.readEncryptedString(handler)
      const value = ConfigValue.read(handler)

      instance.variables.set(name, value)
    }

    return instance
  }
}
