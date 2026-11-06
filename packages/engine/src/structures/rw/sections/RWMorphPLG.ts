import type { UInt32 } from '../../../types.ts'
import type { ZBinaryReader } from '../../../utils/ZBinaryReader.ts'
import type { ZBinaryWriter } from '../../../utils/ZBinaryWriter.ts'
import { RWSection } from '../RWSection.ts'

export class RWMorphPLG extends RWSection {
  morphTargetIndex: UInt32 = 0

  override write(writer: ZBinaryWriter): void {
    writer.writeUInt32(this.morphTargetIndex)
  }

  override read(reader: ZBinaryReader): void {
    this.morphTargetIndex = reader.readUInt32()
  }
}
