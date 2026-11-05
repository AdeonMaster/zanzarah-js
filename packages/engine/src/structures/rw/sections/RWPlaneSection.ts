import type { ZBinaryReader } from '../../../utils/ZBinaryReader.ts'
import { RWContainerSection, RWSection } from '../RWSection.ts'

export class RWPlaneSectionStruct extends RWSection {
  type = 0
  value = 0
  leftIsAtomic = false
  rightIsAtomic = false
  rightValue = 0
  leftValue = 0

  override read(reader: ZBinaryReader): void {
    this.type = reader.readUInt32()
    this.value = reader.readFloat()
    this.leftIsAtomic = reader.readUInt32() > 0
    this.rightIsAtomic = reader.readUInt32() > 0
    this.rightValue = reader.readFloat()
    this.leftValue = reader.readFloat()
  }
}

export class RWPlaneSection extends RWContainerSection {
  get struct(): RWPlaneSectionStruct | null {
    return this.findChild(RWPlaneSectionStruct)
  }
}
