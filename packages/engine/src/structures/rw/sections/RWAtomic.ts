import type { UInt32 } from '../../../types.ts'
import type { ZBinaryReader } from '../../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../../utils/ZBinaryWriter.ts'
import { RWContainerSection, RWSection } from '../RWSection.ts'

export enum AtomicFlags {
  CollisionTest = 0x01,
  Render = 0x02
}

export class RWAtomicStruct extends RWSection {
  frameIndex: UInt32 = 0
  geometryIndex: UInt32 = 0
  flags: UInt32 = 0

  override write(writer: ZBinaryWriter): void {
    writer.writeUInt32(this.frameIndex)
    writer.writeUInt32(this.geometryIndex)
    writer.writeUInt32(this.flags)
  }

  override read(reader: ZBinaryReader): void {
    this.frameIndex = reader.readUInt32()
    this.geometryIndex = reader.readUInt32()
    this.flags = reader.readUInt32()
  }
}

export class RWAtomic extends RWContainerSection {
  get struct(): RWAtomicStruct | null {
    return this.findChild(RWAtomicStruct)
  }
}
