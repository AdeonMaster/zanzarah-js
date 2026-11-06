import type { ZBinaryReader, ZBinaryWriter } from '../../../index.ts'
import type { UInt32 } from '../../../types.ts'
import { RWContainerSection, RWSection } from '../RWSection.ts'

export class RWGeometryListStruct extends RWSection {
  geometryCount: UInt32 = 0

  override write(writer: ZBinaryWriter): void {
    writer.writeUInt32(this.geometryCount)
  }

  override read(reader: ZBinaryReader): void {
    this.geometryCount = reader.readUInt32()
  }
}

export class RWGeometryList extends RWContainerSection {
  get struct(): RWGeometryListStruct | null {
    return this.findChild(RWGeometryListStruct)
  }
}
