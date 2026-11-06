import type { ZBinaryReader, ZBinaryWriter } from '../../../index.ts'
import type { Int32, UInt32 } from '../../../types.ts'
import { RWContainerSection, RWSection } from '../RWSection.ts'

export class RWClampStruct extends RWSection {
  atomicCount: UInt32 = 0
  lightCount: UInt32 = 0
  camCount: Int32 = 0

  override write(writer: ZBinaryWriter): void {
    writer.writeUInt32(this.atomicCount)
    writer.writeUInt32(this.lightCount)
    writer.writeInt32(this.camCount)
  }

  override read(reader: ZBinaryReader): void {
    this.atomicCount = this.lightCount = this.camCount = 0

    if (reader.length >= 4) this.atomicCount = reader.readUInt32()
    if (reader.length >= 8) this.lightCount = reader.readUInt32()
    if (reader.length >= 12) this.camCount = reader.readInt32()
  }
}

export class RWClump extends RWContainerSection {
  get struct(): RWClampStruct | null {
    return this.findChild(RWClampStruct)
  }
}
