import type { ZBinaryReader } from '../../../utils/ZBinaryReader.ts'
import { RWContainerSection } from '../RWContainerSection.ts'
import { RWSection } from '../RWSection.ts'

export class RWTextureStruct extends RWSection {
  filterMode = 0
  uAddressingMode = 0
  vAddressingMode = 0
  flags = 0
  useMipLevels = false

  override read(reader: ZBinaryReader): void {
    this.filterMode = reader.readInt8()
    const addressing = reader.readInt8()
    this.uAddressingMode = addressing & 0xf
    this.vAddressingMode = addressing >> 4
    this.flags = reader.readUInt16()
    this.useMipLevels = (this.flags & 1) > 0
  }
}

export class RWTexture extends RWContainerSection {
  get struct() {
    return this.findChild(RWTextureStruct)
  }
}
